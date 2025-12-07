import { useEffect, useState, useRef } from "react";
import axios from "axios";
import styles from "./style.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "../../config.js";
import JoinTeamModal from "../../components/JoinTeamModal";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";
import { useAuth } from "../../hooks/useAuth";
import SEOHead from "../../components/SEOHead";
import Pagination from "../../components/Pagination";

const TeamsPage = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuth } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [count, setCount] = useState(0);

    const [formQuery, setFormQuery] = useState({ title: "", category_id: "", status: "", required_skills: "", required_qualities: "" });
    const [searchQuery, setSearchQuery] = useState({ title: "", category_id: "", status: "", required_skills: "", required_qualities: "" });
    const [categories, setCategories] = useState([]);
    const [skillsAll, setSkillsAll] = useState([]);
    const [qualitiesAll, setQualitiesAll] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedQualities, setSelectedQualities] = useState([]);
    const [skillQ, setSkillQ] = useState("");
    const [qualityQ, setQualityQ] = useState("");
    const [skillSug, setSkillSug] = useState([]);
    const [qualSug, setQualSug] = useState([]);
    const skillSearchControllerRef = useRef(null);
    const qualitySearchControllerRef = useRef(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        const fetchTeams = async () => {
            try {
                setError(null);
                setLoading(true);
                const params = new URLSearchParams();
                if (searchQuery.title) params.set("title", searchQuery.title);
                if (searchQuery.category_id) params.set("category_id", searchQuery.category_id);
                if (searchQuery.status) params.set("status", searchQuery.status);
                if (searchQuery.required_skills) params.set("required_skills", searchQuery.required_skills);
                if (searchQuery.required_qualities) params.set("required_qualities", searchQuery.required_qualities);
                params.set("page", currentPage.toString());
                const queryString = params.toString() ? '?' + params.toString() : '';
                const url = `${API_URL}teams/${queryString}`;
                const response = await axios.get(url, { signal: controller.signal, timeout: 30000 });
                
                // Обрабатываем ответ с пагинацией
                let teamsData = [];
                let totalCount = 0;
                let totalPagesCount = 1;
                
                if (response.data && Array.isArray(response.data.results)) {
                    // Новый формат с пагинацией
                    teamsData = response.data.results;
                    totalCount = response.data.count || 0;
                    const pageSize = 15;
                    totalPagesCount = Math.ceil(totalCount / pageSize) || 1;
                } else if (Array.isArray(response.data)) {
                    // Старый формат (массив напрямую)
                    teamsData = response.data;
                    totalCount = response.data.length;
                    totalPagesCount = 1;
                } else {
                    // Неожиданный формат - используем пустой массив
                    console.warn("Неожиданный формат ответа API:", response.data);
                    teamsData = [];
                    totalCount = 0;
                    totalPagesCount = 1;
                }
                
                setTeams(teamsData);
                setCount(totalCount);
                setTotalPages(totalPagesCount);
            } catch (error) {
                if (error.name !== 'AbortError' && error.code !== 'ECONNABORTED') {
                    console.error('Ошибка загрузки команд:', error);
                    setError(error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
        return () => controller.abort();
    }, [searchQuery.title, searchQuery.category_id, searchQuery.status, searchQuery.required_skills, searchQuery.required_qualities, currentPage]);
    
    // Сбрасываем страницу на 1 при изменении поискового запроса
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery.title, searchQuery.category_id, searchQuery.status, searchQuery.required_skills, searchQuery.required_qualities]);
    
    // Функция для запуска поиска
    const handleSearch = () => {
        setSearchQuery({ ...formQuery });
        setCurrentPage(1);
    };
    
    // Выполняем начальный поиск при загрузке страницы
    useEffect(() => {
        // Устанавливаем пустой поисковый запрос для начальной загрузки всех команд
        setSearchQuery({ title: "", category_id: "", status: "", required_skills: "", required_qualities: "" });
    }, []); // Только при первой загрузке

    useEffect(() => {
        const controller = new AbortController();
        const fetchCategories = async () => {
            try {
                const res = await axios.get(`${API_URL}project-categories/`, { signal: controller.signal, timeout: 10000 });
                // Обрабатываем ответ - может быть массив или объект с пагинацией
                const categoriesData = Array.isArray(res.data) ? res.data : (res.data?.results || []);
                setCategories(categoriesData);
            } catch (e) {
                if (e.name !== 'AbortError' && e.code !== 'ERR_CANCELED' && e.name !== 'CanceledError') {
                    console.error('Ошибка загрузки категорий:', e);
                }
            }
        };
        fetchCategories();
        return () => controller.abort();
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const fetchMeta = async () => {
            try {
                const [skRes, qRes] = await Promise.all([
                    axios.get(`${API_URL}skills/`, { signal: controller.signal, timeout: 10000 }),
                    axios.get(`${API_URL}personal-qualities/`, { signal: controller.signal, timeout: 10000 }),
                ]);
                const skillsData = Array.isArray(skRes.data) ? skRes.data : (skRes.data?.results || []);
                const qualitiesData = Array.isArray(qRes.data) ? qRes.data : (qRes.data?.results || []);
                setSkillsAll(skillsData.map(s => s.name));
                setQualitiesAll(qualitiesData.map(q => q.name));
            } catch (e) {
                if (e.name !== 'AbortError') {
                    console.error(e);
                }
            }
        };
        fetchMeta();
        return () => controller.abort();
    }, []);

    useEffect(() => {
        // Debounce для предотвращения слишком частых обновлений
        const timeoutId = setTimeout(() => {
            setFormQuery(q => ({ ...q, required_skills: selectedSkills.join(",") }));
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [selectedSkills]);
    useEffect(() => {
        // Debounce для предотвращения слишком частых обновлений
        const timeoutId = setTimeout(() => {
            setFormQuery(q => ({ ...q, required_qualities: selectedQualities.join(",") }));
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [selectedQualities]);

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
        const q = qualityQ.trim();
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
    }, [qualityQ, qualitiesAll]);

    const addSkill = (name) => {
        if (!name || !name.trim()) return;
        const nameLower = name.trim().toLowerCase();
        // Проверяем, не добавлен ли уже этот навык
        if (Array.isArray(selectedSkills) && selectedSkills.some(s => s.toLowerCase() === nameLower)) {
            return;
        }
        // Ищем точное совпадение в skillsAll или используем имя напрямую
        const exists = Array.isArray(skillsAll) ? skillsAll.find(s => s.toLowerCase() === nameLower) : null;
        const skillToAdd = exists || name.trim();
        setSelectedSkills(prev => [...prev, skillToAdd]);
        setSkillQ("");
        setSkillSug([]);
    };
    const removeSkill = (name) => setSelectedSkills(prev => prev.filter(s => s !== name));
    const addQuality = (name) => {
        if (!name || !name.trim()) return;
        const nameLower = name.trim().toLowerCase();
        // Проверяем, не добавлено ли уже это качество
        if (Array.isArray(selectedQualities) && selectedQualities.some(s => s.toLowerCase() === nameLower)) {
            return;
        }
        // Ищем точное совпадение в qualitiesAll или используем имя напрямую
        const exists = Array.isArray(qualitiesAll) ? qualitiesAll.find(s => s.toLowerCase() === nameLower) : null;
        const qualityToAdd = exists || name.trim();
        setSelectedQualities(prev => [...prev, qualityToAdd]);
        setQualityQ("");
        setQualSug([]);
    };
    const removeQuality = (name) => setSelectedQualities(prev => prev.filter(s => s !== name));

    const handleJoinTeam = (team) => {
        setSelectedTeam(team);
        setIsJoinModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsJoinModalOpen(false);
        setSelectedTeam(null);
    };

    const handleJoinSuccess = (message) => {
        alert(message);
        // Можно добавить обновление списка команд или другие действия
    };

    if (error) {
        return (
            <div className={styles.teams_page}>
                <ErrorDisplay
                    error={error}
                    title="Ошибка загрузки команд"
                    onRetry={() => {
                        setError(null);
                        setLoading(true);
                    }}
                    fullScreen={false}
                />
            </div>
        );
    }

    return (
        <>
            <SEOHead 
                title="Команды — UniCrew"
                description="Найдите команду для вашего проекта. Просматривайте доступные команды, фильтруйте по навыкам и категориям проектов."
                keywords="команды, проекты, студенты, поиск команды, хакатон, дипломная работа"
            />
            <div className={styles.teams_page}>
                <div className={styles.toolbar}>
                    <h1>Команды</h1>
                {isAuth ? (
                    <div className={styles.toolbar_btns}>
                        <button className={styles.create_button} onClick={() => navigate('/my-teams')}>
                            Мои команды
                        </button>
                        <button className={styles.create_button} onClick={() => navigate('/teams/create')}>
                            Создать команду
                        </button>
                    </div>
                ) : null}
            </div>
            <div className={styles.filters}>
                <div className={styles.filterRow3}>
                    <input className={styles.input} placeholder="Название" value={formQuery.title} onChange={(e) => setFormQuery({ ...formQuery, title: e.target.value })} />
                    <select className={styles.select} value={formQuery.category_id} onChange={(e) => setFormQuery({ ...formQuery, category_id: e.target.value })}>
                        <option value="">Все категории</option>
                        {Array.isArray(categories) && categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <select className={styles.select} value={formQuery.status} onChange={(e) => setFormQuery({ ...formQuery, status: e.target.value })}>
                        <option value="">Любой статус</option>
                        <option value="OPEN">Открыт набор</option>
                        <option value="CLOSED">Набор закрыт</option>
                        <option value="IN_PROGRESS">В работе</option>
                        <option value="DONE">Завершён</option>
                    </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div className={styles.filterBox}>
                        {Array.isArray(selectedSkills) && selectedSkills.map(s => (
                            <span key={s} className={styles.filterChip}>{s}<button className={styles.filterChipRemove} onClick={() => removeSkill(s)} type="button">×</button></span>
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
                            {Array.isArray(skillSug) && skillSug.length > 0 ? (
                                <div className={styles.suggestions}>
                                    {skillSug.map(s => (
                                        <div key={s} className={styles.suggestionItem} onMouseDown={(e) => { e.preventDefault(); addSkill(s); }}>{s}</div>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div className={styles.filterBox}>
                        {Array.isArray(selectedQualities) && selectedQualities.map(q => (
                            <span key={q} className={styles.filterChip}>{q}<button className={styles.filterChipRemove} onClick={() => removeQuality(q)} type="button">×</button></span>
                        ))}
                        <div className={styles.suggestWrap}>
                            <input
                                className={styles.inputInline}
                                placeholder="Качество..."
                                value={qualityQ}
                                onChange={(e) => {
                                    setQualityQ(e.target.value);
                                }}
                                onKeyDown={(e) => { if (e.key === 'Enter' && qualityQ.trim()) { addQuality(qualityQ.trim()); e.preventDefault(); } }}
                                onBlur={() => setQualSug([])}
                            />
                            <button type="button" className={styles.addBtn} onClick={() => qualityQ.trim() && addQuality(qualityQ.trim())}>Добавить</button>
                            {Array.isArray(qualSug) && qualSug.length > 0 ? (
                                <div className={styles.suggestions}>
                                    {qualSug.map(s => (
                                        <div key={s} className={styles.suggestionItem} onMouseDown={(e) => { e.preventDefault(); addQuality(s); }}>{s}</div>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
                {/* Кнопка поиска */}
                <button 
                    className={styles.searchButton} 
                    onClick={handleSearch}
                >
                    Найти
                </button>
            </div>
            
            <div className={styles.teams_grid}>
                {loading ? (
                    <div className={styles.loading_container}>
                        <LoadingSpinner size="medium" text="Загрузка команд..." fullScreen={false} />
                    </div>
                ) : Array.isArray(teams) && teams.length === 0 ? (
                    <div className={styles.empty_container}>
                        <div className={styles.empty_code}>404</div>
                        <div className={styles.empty_message}>Команды не найдены</div>
                        <div className={styles.empty_description}>
                            Попробуйте изменить параметры поиска или фильтры
                        </div>
                    </div>
                ) : (
                    Array.isArray(teams) && teams.map((team) => (
                    <div key={team.id} className={styles.team_card}>
                        <h2 
                            className={styles.team_title_link}
                            onClick={() => navigate(`/teams/${team.id}`)}
                        >
                            {team.title}
                        </h2>
                        <p>{team.description}</p>
                        <p><strong>Категория:</strong> {team.category}</p>
                        <p><strong>Создатель:</strong> 
                            <span 
                                className={styles.creator_link}
                                onClick={() => navigate(`/users/${team.creator}`)}
                            >
                                @{team.creator}
                            </span>
                        </p>
                        <p><strong>Статус:</strong> {team.status}</p>

                        {team.required_skills?.length > 0 && (
                            <div className={styles.team_tags}>
                                {team.required_skills.slice(0, 3).map((skill, i) => (
                                    <span key={i} className={styles.tag}>{skill}</span>
                                ))}
                                {team.required_skills.length > 3 && (
                                    <span className={styles.tag_more}>+{team.required_skills.length - 3}</span>
                                )}
                            </div>
                        )}

                        {team.required_qualities?.length > 0 && (
                            <div className={styles.team_tags}>
                                {team.required_qualities.slice(0, 2).map((quality, i) => (
                                    <span key={i} className={styles.tag_quality}>{quality}</span>
                                ))}
                                {team.required_qualities.length > 2 && (
                                    <span className={styles.tag_more}>+{team.required_qualities.length - 2}</span>
                                )}
                            </div>
                        )}

                        <div className={styles.members_list}>
                            <strong>Участники:</strong>
                            {Array.isArray(team.members) && team.members.filter(member => member.status === 'APPROVED').length > 0 ? (
                                <ul>
                                    {team.members.filter(member => member.status === 'APPROVED').map((member) => (
                                        <li key={member.id}>
                                            @{member.user}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <span className={styles.no_members}>Нет участников</span>
                            )}
                        </div>

                        <span className={styles.created_at}>
                            Создано: {new Date(team.created_at).toLocaleString()}
                        </span>

                        {isAuth && team.creator !== isAuth.username && Array.isArray(team.members) && !team.members.some(member => member.user === isAuth.username && member.status === 'APPROVED') && (
                            <button 
                                className={styles.join_button}
                                onClick={() => handleJoinTeam(team)}
                            >
                                Подать заявку
                            </button>
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

            <JoinTeamModal
                team={selectedTeam}
                isOpen={isJoinModalOpen}
                onClose={handleCloseModal}
                onSuccess={handleJoinSuccess}
            />
        </div>
        </>
    );
};

export default TeamsPage;
