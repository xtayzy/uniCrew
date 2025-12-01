import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config.js";
import styles from "./style.module.css";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import PageTransition from "../../components/PageTransition";
import ErrorDisplay from "../../components/ErrorDisplay";
import { useAuth } from "../../hooks/useAuth";

function UsersPage() {
    const { tokens, isInitializing } = useAuth();
    const navigate = useNavigate();
    const access = tokens?.access;
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState({ username: "", faculty: "", school: "", course: "", education: "", skills: "", personal_qualities: "" });
    const [isRequesting, setIsRequesting] = useState(false);

    useEffect(() => {
        // Ждем завершения инициализации токенов
        if (isInitializing) return;
        if (isRequesting) return; // Защита от повторных запросов
        
        setLoading(true);
        setError(null);
        setIsRequesting(true);
        
        const params = new URLSearchParams();
        if (query.username) params.set("username", query.username);
        if (query.faculty) params.set("faculty", query.faculty);
        if (query.school) params.set("school", query.school);
        if (query.course) params.set("course", query.course);
        if (query.education) params.set("education", query.education);
        if (query.skills) params.set("skills", query.skills);
        if (query.personal_qualities) params.set("personal_qualities", query.personal_qualities);
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
                setUsers(res.data);
                setError(null);
                setLoading(false);
                setIsRequesting(false);
            })
            .catch(err => {
                clearTimeout(timeoutId);
                // Игнорируем отмененные запросы (при размонтировании или обновлении страницы)
                if (err.name === 'AbortError' || err.code === 'ECONNABORTED' || err.code === 'ERR_CANCELED' || err.name === 'CanceledError') {
                    // Не устанавливаем ошибку для отмененных запросов
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
    }, [isInitializing, tokens, query.username, query.faculty, query.school, query.course, query.education, query.skills, query.personal_qualities]);

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
                    <input className={styles.input} placeholder="Username" value={query.username} onChange={(e) => setQuery({ ...query, username: e.target.value })} />
                </div>
                {/* Ряд 2: школа/факультет */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                    <SchoolFacultyPicker access={access} value={{ school: query.school, faculty: query.faculty }} onChange={(v) => setQuery({ ...query, school: v.school, faculty: v.faculty })} />
                </div>
                {/* Ряд 3: курс/образование */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <input className={styles.input} placeholder="Курс" value={query.course} onChange={(e) => setQuery({ ...query, course: e.target.value })} />
                    <select className={styles.select} value={query.education} onChange={(e) => setQuery({ ...query, education: e.target.value })}>
                        <option value="">Любое образование</option>
                        <option value="BACHELOR">Бакалавриат</option>
                        <option value="MASTER">Магистратура</option>
                        <option value="PHD">Докторантура</option>
                        <option value="OTHER">Другое</option>
                    </select>
                </div>
                {/* Ряд 4: навыки/качества */}
                <SkillsQualitiesPicker onChange={(skills, qualities) => setQuery({ ...query, skills, personal_qualities: qualities })} />
            </div>
            
            <PageTransition 
                isLoading={loading} 
                loadingComponent={<LoadingSkeleton type="user-card" count={8} />}
                minHeight="400px"
            >
                <div className={styles.users_grid}>
                    {users.map(user => (
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
            .then(res => setFaculties(res.data || []))
            .catch(() => setFaculties([]));
    }, [value.school, access]);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <select className={styles.select} value={value.school} onChange={(e) => onChange({ school: e.target.value, faculty: "" })}>
                <option value="">Школа</option>
                {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>
            <select className={styles.select} value={value.faculty} onChange={(e) => onChange({ ...value, faculty: e.target.value })} disabled={!value.school}>
                <option value="">Факультет</option>
                {faculties.map(f => (
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
            setSkillsAll((sk.data || []).map(s => s.name));
            setQualitiesAll((q.data || []).map(x => x.name));
        }).catch((err) => {
            // Игнорируем отмененные запросы (при размонтировании или обновлении страницы)
            if (err.name !== 'AbortError' && err.code !== 'ERR_CANCELED' && err.name !== 'CanceledError') {
                console.error("Ошибка загрузки навыков/качеств:", err);
            }
        });
        return () => controller.abort();
    }, []);

    useEffect(() => {
        // Debounce для предотвращения слишком частых обновлений
        const timeoutId = setTimeout(() => {
            onChange(skillsSel.join(','), qualsSel.join(','));
        }, 300);
        return () => clearTimeout(timeoutId);
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
                {skillsSel.map(s => (
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
                {skillSug.length > 0 ? (
                    <div className={styles.suggestions}>
                        {skillSug.map(s => (
                            <div key={s} className={styles.suggestionItem} onMouseDown={(e) => { e.preventDefault(); addSkill(s); }}>{s}</div>
                        ))}
                    </div>
                ) : null}
            </div>
            <div className={styles.filterBox}>
                {qualsSel.map(q => (
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
                {qualSug.length > 0 ? (
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
