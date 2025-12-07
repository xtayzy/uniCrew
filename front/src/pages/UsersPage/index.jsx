import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "../../config.js";
import styles from "./style.module.css";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import PageTransition from "../../components/PageTransition";
import ErrorDisplay from "../../components/ErrorDisplay";
import { useAuth } from "../../hooks/useAuth";
import Pagination from "../../components/Pagination";

function UsersPage() {
    const { tokens, isInitializing } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const access = tokens?.access;
    const isMountedRef = useRef(true);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formQuery, setFormQuery] = useState({ username: "", faculty: "", school: "", course: "", education: "", skills: "", personal_qualities: "" });
    const [searchQuery, setSearchQuery] = useState({ username: "", faculty: "", school: "", course: "", education: "", skills: "", personal_qualities: "" });
    const [isRequesting, setIsRequesting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [count, setCount] = useState(0);

    // Отслеживаем размонтирование компонента и сбрасываем состояние при переходе
    useEffect(() => {
        if (location.pathname !== '/users') {
            isMountedRef.current = false;
            // Сбрасываем состояние при переходе на другую страницу
            setUsers([]);
            setLoading(true);
            setError(null);
            setIsRequesting(false);
            return;
        }
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, [location.pathname]);

    useEffect(() => {
        // Проверяем, что мы на странице /users
        if (location.pathname !== '/users') {
            return;
        }
        
        // Ждем завершения инициализации токенов
        if (isInitializing) return;
        if (isRequesting) return; // Защита от повторных запросов
        
        setLoading(true);
        setError(null);
        setIsRequesting(true);
        
        const params = new URLSearchParams();
        if (searchQuery.username) params.set("username", searchQuery.username);
        if (searchQuery.faculty) params.set("faculty", searchQuery.faculty);
        if (searchQuery.school) params.set("school", searchQuery.school);
        if (searchQuery.course) params.set("course", searchQuery.course);
        if (searchQuery.education) params.set("education", searchQuery.education);
        if (searchQuery.skills) params.set("skills", searchQuery.skills);
        if (searchQuery.personal_qualities) params.set("personal_qualities", searchQuery.personal_qualities);
        params.set("page", currentPage.toString());
        const url = `${API_URL}users/${params.toString() ? `?${params.toString()}` : ""}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 секунд таймаут
        
        // Используем axios interceptor для автоматического добавления токена
        // Если токен есть, interceptor добавит его автоматически
        const config = {
            signal: controller.signal,
            timeout: 30000
        };
        
        // Добавляем токен явно, если он есть (на случай, если interceptor еще не настроен)
        if (tokens?.access) {
            config.headers = { Authorization: `Bearer ${tokens.access}` };
        }
        
        axios.get(url, config)
            .then(res => {
                clearTimeout(timeoutId);
                // Проверяем, что компонент все еще смонтирован и мы на правильной странице
                if (!isMountedRef.current || location.pathname !== '/users') {
                    return;
                }
                
                // Обрабатываем ответ с пагинацией
                let usersData = [];
                let totalCount = 0;
                let totalPagesCount = 1;
                
                if (res.data && Array.isArray(res.data.results)) {
                    // Новый формат с пагинацией
                    usersData = res.data.results;
                    totalCount = res.data.count || 0;
                    const pageSize = 28;
                    totalPagesCount = Math.ceil(totalCount / pageSize) || 1;
                } else if (Array.isArray(res.data)) {
                    // Старый формат (массив напрямую)
                    usersData = res.data;
                    totalCount = res.data.length;
                    totalPagesCount = 1;
                } else {
                    // Неожиданный формат - используем пустой массив
                    console.warn("Неожиданный формат ответа API:", res.data);
                    usersData = [];
                    totalCount = 0;
                    totalPagesCount = 1;
                }
                
                // Дополнительная проверка перед обновлением состояния
                if (isMountedRef.current && location.pathname === '/users') {
                    setUsers(usersData);
                    setCount(totalCount);
                    setTotalPages(totalPagesCount);
                    setError(null);
                    setLoading(false);
                    setIsRequesting(false);
                }
            })
            .catch(err => {
                clearTimeout(timeoutId);
                // Игнорируем отмененные запросы (при размонтировании или обновлении страницы)
                if (err.name === 'AbortError' || err.code === 'ECONNABORTED' || err.code === 'ERR_CANCELED' || err.name === 'CanceledError') {
                    // Не устанавливаем ошибку для отмененных запросов
                    return;
                }
                // Проверяем, что компонент все еще смонтирован и мы на правильной странице
                if (!isMountedRef.current || location.pathname !== '/users') {
                    return;
                }
                console.error("Ошибка загрузки пользователей:", err);
                setError(err);
                setLoading(false);
                setIsRequesting(false);
            });
            
        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [isInitializing, tokens, searchQuery.username, searchQuery.faculty, searchQuery.school, searchQuery.course, searchQuery.education, searchQuery.skills, searchQuery.personal_qualities, currentPage, location.pathname]);
    
    // Сбрасываем страницу на 1 при изменении поискового запроса
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery.username, searchQuery.faculty, searchQuery.school, searchQuery.course, searchQuery.education, searchQuery.skills, searchQuery.personal_qualities]);
    
    // Функция для запуска поиска
    const handleSearch = () => {
        setSearchQuery({ ...formQuery });
        setCurrentPage(1);
    };
    
    // Выполняем начальный поиск при загрузке страницы
    useEffect(() => {
        if (location.pathname !== '/users') return;
        if (!isInitializing) {
            handleSearch();
        }
    }, [isInitializing, location.pathname]); // Только при первой загрузке

    // Не рендерим контент, если мы не на странице /users
    if (location.pathname !== '/users') {
        return null;
    }

    if (error) {
        return (
            <div className={styles.users_page}>
                <ErrorDisplay
                    error={error}
                    title="Ошибка загрузки пользователей"
                    onRetry={() => {
                        setError(null);
                        setIsRequesting(false);
                        setLoading(true);
                    }}
                    fullScreen={false}
                />
            </div>
        );
    }

    return (
        <div className={styles.users_page}>
            <h2>Все пользователи</h2>
            <div style={{ display: 'grid', gap: 8, marginBottom: 0 }}>
                {/* Ряд 1: username */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                    <input className={styles.input} placeholder="Username" value={formQuery.username} onChange={(e) => setFormQuery({ ...formQuery, username: e.target.value })} />
                </div>
                {/* Ряд 2: школа/факультет */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                    <SchoolFacultyPicker access={access} value={{ school: formQuery.school, faculty: formQuery.faculty }} onChange={(v) => setFormQuery({ ...formQuery, school: v.school, faculty: v.faculty })} />
                </div>
                {/* Ряд 3: курс/образование */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <input className={styles.input} placeholder="Курс" value={formQuery.course} onChange={(e) => setFormQuery({ ...formQuery, course: e.target.value })} />
                    <select className={styles.select} value={formQuery.education} onChange={(e) => setFormQuery({ ...formQuery, education: e.target.value })}>
                        <option value="">Любое образование</option>
                        <option value="BACHELOR">Бакалавриат</option>
                        <option value="MASTER">Магистратура</option>
                        <option value="PHD">Докторантура</option>
                        <option value="OTHER">Другое</option>
                    </select>
                </div>
                {/* Ряд 4: навыки/качества */}
                <SkillsQualitiesPicker onChange={(skills, qualities) => setFormQuery({ ...formQuery, skills, personal_qualities: qualities })} />
                {/* Кнопка поиска */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                    <button 
                        onClick={handleSearch}
                        style={{
                            padding: '12px 32px',
                            fontSize: '16px',
                            fontWeight: '600',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                    >
                        Найти
                    </button>
                </div>
            </div>
            
            <PageTransition 
                isLoading={loading} 
                loadingComponent={<LoadingSkeleton type="user-card" count={8} />}
                minHeight="400px"
            >
                <div className={styles.users_grid}>
                    {Array.isArray(users) && users.map(user => (
                    <div 
                        key={user.id} 
                        className={styles.user_card}
                        onClick={() => navigate(`/users/${user.username}`)}
                    >
                        <h3 className={styles.user_name_link}>{user.username}</h3>
                        {(user.first_name || user.last_name) ? (
                            <div className={styles.user_subname}>{`${user.first_name || ''} ${user.last_name || ''}`.trim()}</div>
                        ) : null}

                        <p className={styles.user_edu}>
                            🎓 {user.education_level_display}
                            {user.course ? ` • ${user.course} курс` : ""}
                        </p>

                        <p className={styles.user_role}>{user.position || "—"}</p>

                        {user.skills_list?.length > 0 && (
                            <div className={styles.user_skills}>
                                {user.skills_list.slice(0, 3).map((s, j) => (
                                    <span key={j} className={styles.tag}>{s}</span>
                                ))}
                                {user.skills_list.length > 3 && (
                                    <span className={styles.tag_more}>+{user.skills_list.length - 3}</span>
                                )}
                            </div>
                        )}

                        {user.personal_qualities_list?.length > 0 && (
                            <div className={styles.user_qualities}>
                                {user.personal_qualities_list.slice(0, 2).map((q, j) => (
                                    <span key={j} className={styles.tag_quality}>{q}</span>
                                ))}
                                {user.personal_qualities_list.length > 2 && (
                                    <span className={styles.tag_more}>+{user.personal_qualities_list.length - 2}</span>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                </div>
                {!loading && totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => {
                            setCurrentPage(page);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    />
                )}
            </PageTransition>
        </div>
    );
}

export default UsersPage;

function SchoolFacultyPicker({ value, onChange, access }) {
    const [schools, setSchools] = useState([]);
    const [faculties, setFaculties] = useState([]);

    useEffect(() => {
        const headers = access ? { Authorization: `Bearer ${access}` } : {};
        axios.get(`${API_URL}schools/`, { headers })
            .then(res => setSchools(res.data || []))
            .catch(() => setSchools([]));
    }, [access]);

    useEffect(() => {
        if (!value.school) { setFaculties([]); return; }
        const headers = access ? { Authorization: `Bearer ${access}` } : {};
        axios.get(`${API_URL}faculties/?school=${value.school}`, { headers })
            .then(res => {
                const facultiesData = Array.isArray(res.data) ? res.data : (res.data?.results || []);
                setFaculties(facultiesData);
            })
            .catch(() => setFaculties([]));
    }, [value.school, access]);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <select className={styles.select} value={value.school} onChange={(e) => onChange({ school: e.target.value, faculty: "" })}>
                <option value="">Школа</option>
                {Array.isArray(schools) && schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>
            <select className={styles.select} value={value.faculty} onChange={(e) => onChange({ ...value, faculty: e.target.value })} disabled={!value.school}>
                <option value="">Факультет</option>
                {Array.isArray(faculties) && faculties.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                ))}
            </select>
        </div>
    );
}

function SkillsQualitiesPicker({ onChange }) {
    const [skillsAll, setSkillsAll] = useState([]);
    const [qualitiesAll, setQualitiesAll] = useState([]);
    const [skillsSel, setSkillsSel] = useState([]);
    const [qualsSel, setQualsSel] = useState([]);
    const [skillQ, setSkillQ] = useState("");
    const [qualQ, setQualQ] = useState("");
    const [skillSug, setSkillSug] = useState([]);
    const [qualSug, setQualSug] = useState([]);

    useEffect(() => {
        const controller = new AbortController();
        Promise.all([
            axios.get(`${API_URL}skills/`, { signal: controller.signal, timeout: 10000 }),
            axios.get(`${API_URL}personal-qualities/`, { signal: controller.signal, timeout: 10000 })
        ]).then(([sk, q]) => {
            const skillsData = Array.isArray(sk.data) ? sk.data : (sk.data?.results || []);
            const qualitiesData = Array.isArray(q.data) ? q.data : (q.data?.results || []);
            setSkillsAll(skillsData.map(s => s.name));
            setQualitiesAll(qualitiesData.map(x => x.name));
        }).catch((err) => {
            // Игнорируем отмененные запросы (при размонтировании или обновлении страницы)
            if (err.name !== 'AbortError' && err.code !== 'ERR_CANCELED' && err.name !== 'CanceledError') {
                console.error("Ошибка загрузки навыков/качеств:", err);
            }
        });
        return () => controller.abort();
    }, []);

    // Обновляем formQuery при изменении навыков и качеств
    useEffect(() => {
        onChange(skillsSel.join(','), qualsSel.join(','));
    }, [skillsSel, qualsSel, onChange]);

    const addSkill = (name) => {
        const exists = skillsAll.find(s => s.toLowerCase() === name.toLowerCase());
        if (!exists) return;
        if (skillsSel.some(s => s.toLowerCase() === exists.toLowerCase())) return;
        setSkillsSel(prev => [...prev, exists]);
        setSkillQ("");
        setSkillSug([]);
    };
    const addQual = (name) => {
        const exists = qualitiesAll.find(s => s.toLowerCase() === name.toLowerCase());
        if (!exists) return;
        if (qualsSel.some(s => s.toLowerCase() === exists.toLowerCase())) return;
        setQualsSel(prev => [...prev, exists]);
        setQualQ("");
        setQualSug([]);
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div className={styles.filterBox}>
                {Array.isArray(skillsSel) && skillsSel.map(s => (
                    <span key={s} className={styles.filterChip}>{s}<button className={styles.filterChipRemove} type="button" onClick={() => setSkillsSel(prev => prev.filter(x => x !== s))}>×</button></span>
                ))}
                <div className={styles.suggestWrap}>
                    <input
                        className={styles.inputInline}
                        placeholder="Навык..."
                        value={skillQ}
                        onChange={(e) => {
                            const v = e.target.value;
                            setSkillQ(v);
                            const q = v.trim().toLowerCase();
                            setSkillSug(q ? skillsAll.filter(s => s.toLowerCase().includes(q)).slice(0, 20) : []);
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter' && skillQ.trim()) { addSkill(skillQ.trim()); e.preventDefault(); } }}
                        onBlur={() => setSkillSug([])}
                    />
                    <button type="button" className={styles.addBtn} onClick={() => skillQ.trim() && addSkill(skillQ.trim())}>Добавить</button>
                </div>
                {Array.isArray(skillSug) && skillSug.length > 0 ? (
                    <div className={styles.suggestions}>
                        {skillSug.map(s => (
                            <div key={s} className={styles.suggestionItem} onMouseDown={(e) => { e.preventDefault(); addSkill(s); }}>{s}</div>
                        ))}
                    </div>
                ) : null}
            </div>
            <div className={styles.filterBox}>
                {Array.isArray(qualsSel) && qualsSel.map(q => (
                    <span key={q} className={styles.filterChip}>{q}<button className={styles.filterChipRemove} type="button" onClick={() => setQualsSel(prev => prev.filter(x => x !== q))}>×</button></span>
                ))}
                <div className={styles.suggestWrap}>
                    <input
                        className={styles.inputInline}
                        placeholder="Качество..."
                        value={qualQ}
                        onChange={(e) => {
                            const v = e.target.value;
                            setQualQ(v);
                            const q = v.trim().toLowerCase();
                            setQualSug(q ? qualitiesAll.filter(s => s.toLowerCase().includes(q)).slice(0, 20) : []);
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter' && qualQ.trim()) { addQual(qualQ.trim()); e.preventDefault(); } }}
                        onBlur={() => setQualSug([])}
                    />
                    <button type="button" className={styles.addBtn} onClick={() => qualQ.trim() && addQual(qualQ.trim())}>Добавить</button>
                </div>
                {Array.isArray(qualSug) && qualSug.length > 0 ? (
                    <div className={styles.suggestions}>
                        {qualSug.map(s => (
                            <div key={s} className={styles.suggestionItem} onMouseDown={(e) => { e.preventDefault(); addQual(s); }}>{s}</div>
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
