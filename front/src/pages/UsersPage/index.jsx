import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "../../config.js";
import styles from "./style.module.css";
import LoadingSpinner from "../../components/LoadingSpinner";
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

    // Отслеживаем размонтирование компонента
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []); // Убираем зависимость от location.pathname, чтобы не блокировать обновление

    useEffect(() => {
        // Ранний возврат, если мы не на странице /users
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : location.pathname;
        if (currentPath !== '/users') {
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
                // Проверяем, что компонент все еще смонтирован
                if (!isMountedRef.current) {
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
                
                // Проверяем, что компонент все еще смонтирован перед обновлением состояния
                if (isMountedRef.current) {
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
                // Проверяем, что компонент все еще смонтирован
                if (!isMountedRef.current) {
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
        const newSearchQuery = { ...formQuery };
        setSearchQuery(newSearchQuery);
        setCurrentPage(1);
    };
    
    // Выполняем начальный поиск при загрузке страницы
    useEffect(() => {
        // Ранний возврат, если мы не на странице /users
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : location.pathname;
        if (currentPath !== '/users') {
            return;
        }
        
        if (!isInitializing) {
            handleSearch();
        }
    }, [isInitializing, location.pathname]); // Только при первой загрузке

    // Ранний возврат, если мы не на странице /users
    // Используем window.location.pathname для более надежной проверки
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : location.pathname;
    if (currentPath !== '/users') {
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
                {/* Ряд 1: username, school, faculty */}
                <div className={styles.filterRow3}>
                    <input 
                        className={styles.input} 
                        placeholder="Username" 
                        value={formQuery.username || ""} 
                        onChange={(e) => {
                            const newValue = e.target.value;
                            setFormQuery(prev => ({ ...prev, username: newValue }));
                        }} 
                    />
                    <SchoolFacultyPicker 
                        access={access} 
                        value={{ school: formQuery.school || "", faculty: formQuery.faculty || "" }} 
                        onChange={(v) => {
                            setFormQuery(prev => ({ ...prev, school: v.school || "", faculty: v.faculty || "" }));
                        }} 
                    />
                </div>
                {/* Ряд 3: курс/образование */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <input 
                        className={styles.input} 
                        placeholder="Курс" 
                        value={formQuery.course || ""} 
                        onChange={(e) => {
                            const newValue = e.target.value;
                            setFormQuery(prev => ({ ...prev, course: newValue }));
                        }} 
                    />
                    <select 
                        className={styles.select} 
                        value={formQuery.education || ""} 
                        onChange={(e) => {
                            const newValue = e.target.value;
                            setFormQuery(prev => ({ ...prev, education: newValue }));
                        }}
                    >
                        <option value="">Любое образование</option>
                        <option value="BACHELOR">Бакалавриат</option>
                        <option value="MASTER">Магистратура</option>
                        <option value="PHD">Докторантура</option>
                        <option value="OTHER">Другое</option>
                    </select>
                </div>
                {/* Ряд 4: навыки/качества */}
                <SkillsQualitiesPicker 
                    onChange={useCallback((skills, qualities) => {
                        setFormQuery(prev => ({ ...prev, skills: skills || "", personal_qualities: qualities || "" }));
                    }, [])} 
                />
                {/* Кнопка поиска */}
                <button 
                    className={styles.searchButton} 
                    onClick={handleSearch}
                >
                    Найти
                </button>
            </div>
            
            <div className={styles.users_grid}>
                {loading ? (
                    <div className={styles.loading_container}>
                        <LoadingSpinner size="medium" text="Загрузка пользователей..." fullScreen={false} />
                    </div>
                ) : (
                    Array.isArray(users) && users.map(user => (
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
                    ))
                )}
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
            .then(res => {
                // Обрабатываем ответ - может быть массив или объект с пагинацией
                const schoolsData = Array.isArray(res.data) ? res.data : (res.data?.results || []);
                setSchools(schoolsData);
            })
            .catch((err) => {
                console.error('Ошибка загрузки школ:', err);
                setSchools([]);
            });
    }, [access]);

    useEffect(() => {
        if (!value.school || value.school === "") { 
            setFaculties([]); 
            return; 
        }
        
        const headers = access ? { Authorization: `Bearer ${access}` } : {};
        const schoolId = value.school;
        const url = `${API_URL}faculties/?school=${schoolId}`;
        
        axios.get(url, { headers })
            .then(res => {
                const facultiesData = Array.isArray(res.data) ? res.data : (res.data?.results || []);
                setFaculties(facultiesData);
            })
            .catch((err) => {
                console.error('Ошибка загрузки факультетов:', err);
                setFaculties([]);
            });
    }, [value.school, access]);

    return (
        <>
            <select 
                className={styles.select} 
                value={value.school || ""} 
                onChange={(e) => {
                    const schoolValue = e.target.value;
                    onChange({ school: schoolValue, faculty: "" });
                }}
            >
                <option value="">Школа</option>
                {Array.isArray(schools) && schools.map(s => (
                    <option key={s.id} value={String(s.id)}>{s.name}</option>
                ))}
            </select>
            <select 
                className={styles.select} 
                value={value.faculty || ""} 
                onChange={(e) => {
                    const facultyValue = e.target.value;
                    onChange({ ...value, faculty: facultyValue });
                }} 
                disabled={!value.school}
            >
                <option value="">Факультет</option>
                {Array.isArray(faculties) && faculties.length > 0 && faculties.map(f => (
                    <option key={f.id} value={String(f.id)}>{f.name}</option>
                ))}
            </select>
        </>
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
    const skillSearchControllerRef = useRef(null);
    const qualitySearchControllerRef = useRef(null);

    // Загружаем все навыки и качества для начальной загрузки (для совместимости)
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

    // Обновляем formQuery при изменении навыков и качеств с debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const skillsStr = Array.isArray(skillsSel) ? skillsSel.join(',') : '';
            const qualitiesStr = Array.isArray(qualsSel) ? qualsSel.join(',') : '';
            onChange(skillsStr, qualitiesStr);
        }, 300); // Debounce 300ms
        
        return () => clearTimeout(timeoutId);
    }, [skillsSel, qualsSel]); // Убрали onChange из зависимостей

    // Debounce для поиска навыков через API
    useEffect(() => {
        const q = skillQ.trim();
        if (q.length < 1) {
            setSkillSug([]);
            if (skillSearchControllerRef.current) {
                skillSearchControllerRef.current.abort();
            }
            return;
        }
        
        // Отменяем предыдущий запрос
        if (skillSearchControllerRef.current) {
            skillSearchControllerRef.current.abort();
        }
        
        const timeoutId = setTimeout(() => {
            // Используем API для поиска навыков
            const controller = new AbortController();
            skillSearchControllerRef.current = controller;
            axios.get(`${API_URL}skills/?q=${encodeURIComponent(q)}`, { 
                signal: controller.signal, 
                timeout: 5000 
            }).then((res) => {
                const skillsData = Array.isArray(res.data) ? res.data : (res.data?.results || []);
                const queryLower = q.toLowerCase();
                const filtered = Array.isArray(skillsData) ? skillsData
                    .filter(skill => skill.name && skill.name.toLowerCase().includes(queryLower))
                    .slice(0, 20)
                    .map(s => s.name) : [];
                setSkillSug(filtered);
            }).catch((err) => {
                if (err.name !== 'AbortError' && err.code !== 'ERR_CANCELED') {
                    // Fallback на локальный поиск
                    const filtered = Array.isArray(skillsAll) ? skillsAll
                        .filter(s => s.toLowerCase().includes(q.toLowerCase()))
                        .slice(0, 20) : [];
                    setSkillSug(filtered);
                }
            });
        }, 300);
        
        return () => {
            clearTimeout(timeoutId);
            if (skillSearchControllerRef.current) {
                skillSearchControllerRef.current.abort();
            }
        };
    }, [skillQ, skillsAll]);

    // Debounce для поиска качеств через API
    useEffect(() => {
        const q = qualQ.trim();
        if (q.length < 1) {
            setQualSug([]);
            if (qualitySearchControllerRef.current) {
                qualitySearchControllerRef.current.abort();
            }
            return;
        }
        
        // Отменяем предыдущий запрос
        if (qualitySearchControllerRef.current) {
            qualitySearchControllerRef.current.abort();
        }
        
        const timeoutId = setTimeout(() => {
            // Используем API для поиска качеств
            const controller = new AbortController();
            qualitySearchControllerRef.current = controller;
            axios.get(`${API_URL}personal-qualities/?q=${encodeURIComponent(q)}`, { 
                signal: controller.signal, 
                timeout: 5000 
            }).then((res) => {
                const qualitiesData = Array.isArray(res.data) ? res.data : (res.data?.results || []);
                const queryLower = q.toLowerCase();
                const filtered = Array.isArray(qualitiesData) ? qualitiesData
                    .filter(quality => quality.name && quality.name.toLowerCase().includes(queryLower))
                    .slice(0, 20)
                    .map(q => q.name) : [];
                setQualSug(filtered);
            }).catch((err) => {
                if (err.name !== 'AbortError' && err.code !== 'ERR_CANCELED') {
                    // Fallback на локальный поиск
                    const filtered = Array.isArray(qualitiesAll) ? qualitiesAll
                        .filter(s => s.toLowerCase().includes(q.toLowerCase()))
                        .slice(0, 20) : [];
                    setQualSug(filtered);
                }
            });
        }, 300);
        
        return () => {
            clearTimeout(timeoutId);
            if (qualitySearchControllerRef.current) {
                qualitySearchControllerRef.current.abort();
            }
        };
    }, [qualQ, qualitiesAll]);

    const addSkill = (name) => {
        if (!name || !name.trim()) return;
        const nameLower = name.trim().toLowerCase();
        // Проверяем, не добавлен ли уже этот навык
        if (Array.isArray(skillsSel) && skillsSel.some(s => s.toLowerCase() === nameLower)) {
            return;
        }
        // Ищем точное совпадение в skillsAll или используем имя напрямую
        const exists = Array.isArray(skillsAll) ? skillsAll.find(s => s.toLowerCase() === nameLower) : null;
        const skillToAdd = exists || name.trim();
        setSkillsSel(prev => [...prev, skillToAdd]);
        setSkillQ("");
        setSkillSug([]);
    };
    const addQual = (name) => {
        if (!name || !name.trim()) return;
        const nameLower = name.trim().toLowerCase();
        // Проверяем, не добавлено ли уже это качество
        if (Array.isArray(qualsSel) && qualsSel.some(s => s.toLowerCase() === nameLower)) {
            return;
        }
        // Ищем точное совпадение в qualitiesAll или используем имя напрямую
        const exists = Array.isArray(qualitiesAll) ? qualitiesAll.find(s => s.toLowerCase() === nameLower) : null;
        const qualityToAdd = exists || name.trim();
        setQualsSel(prev => [...prev, qualityToAdd]);
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
                            setSkillQ(e.target.value);
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
                            setQualQ(e.target.value);
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
