import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./style.module.css";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config.js";
import JoinTeamModal from "../../components/JoinTeamModal";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import LoadingSpinner from "../../components/LoadingSpinner";
import PageTransition from "../../components/PageTransition";
import ErrorDisplay from "../../components/ErrorDisplay";
import { useAuth } from "../../hooks/useAuth";
import SEOHead from "../../components/SEOHead";
import Pagination from "../../components/Pagination";

const TeamsPage = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { isAuth } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [count, setCount] = useState(0);

    const [query, setQuery] = useState({ title: "", category_id: "", status: "", required_skills: "", required_qualities: "" });
    const [categories, setCategories] = useState([]);
    const [skillsAll, setSkillsAll] = useState([]);
    const [qualitiesAll, setQualitiesAll] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedQualities, setSelectedQualities] = useState([]);
    const [skillQ, setSkillQ] = useState("");
    const [qualityQ, setQualityQ] = useState("");
    const [skillSug, setSkillSug] = useState([]);
    const [qualSug, setQualSug] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        const fetchTeams = async () => {
            try {
                setError(null);
                setLoading(true);
                const params = new URLSearchParams();
                if (query.title) params.set("title", query.title);
                if (query.category_id) params.set("category_id", query.category_id);
                if (query.status) params.set("status", query.status);
                if (query.required_skills) params.set("required_skills", query.required_skills);
                if (query.required_qualities) params.set("required_qualities", query.required_qualities);
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
    }, [query.title, query.category_id, query.status, query.required_skills, query.required_qualities, currentPage]);
    
    // Сбрасываем страницу на 1 при изменении фильтров
    useEffect(() => {
        setCurrentPage(1);
    }, [query.title, query.category_id, query.status, query.required_skills, query.required_qualities]);

    useEffect(() => {
        const controller = new AbortController();
        const fetchCategories = async () => {
            try {
                const res = await axios.get(`${API_URL}project-categories/`, { signal: controller.signal, timeout: 10000 });
                setCategories(res.data || []);
            } catch (e) {
                if (e.name !== 'AbortError') {
                    console.error(e);
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
            setQuery(q => ({ ...q, required_skills: selectedSkills.join(",") }));
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [selectedSkills]);
    useEffect(() => {
        // Debounce для предотвращения слишком частых обновлений
        const timeoutId = setTimeout(() => {
            setQuery(q => ({ ...q, required_qualities: selectedQualities.join(",") }));
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [selectedQualities]);

    const addSkill = (name) => {
        const exists = skillsAll.find(s => s.toLowerCase() === name.toLowerCase());
        if (!exists) return;
        if (selectedSkills.some(s => s.toLowerCase() === exists.toLowerCase())) return;
        setSelectedSkills(prev => [...prev, exists]);
        setSkillQ("");
        setSkillSug([]);
    };
    const removeSkill = (name) => setSelectedSkills(prev => prev.filter(s => s !== name));
    const addQuality = (name) => {
        const exists = qualitiesAll.find(s => s.toLowerCase() === name.toLowerCase());
        if (!exists) return;
        if (selectedQualities.some(s => s.toLowerCase() === exists.toLowerCase())) return;
        setSelectedQualities(prev => [...prev, exists]);
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
                    <input className={styles.input} placeholder="Название" value={query.title} onChange={(e) => setQuery({ ...query, title: e.target.value })} />
                    <select className={styles.select} value={query.category_id} onChange={(e) => setQuery({ ...query, category_id: e.target.value })}>
                        <option value="">Все категории</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <select className={styles.select} value={query.status} onChange={(e) => setQuery({ ...query, status: e.target.value })}>
                        <option value="">Любой статус</option>
                        <option value="OPEN">Открыт набор</option>
                        <option value="CLOSED">Набор закрыт</option>
                        <option value="IN_PROGRESS">В работе</option>
                        <option value="DONE">Завершён</option>
                    </select>
                </div>
                <div className={styles.filterRow2}>
                    <div className={styles.filterBox}>
                        {selectedSkills.map(s => (
                            <span key={s} className={styles.filterChip}>{s}<button className={styles.filterChipRemove} onClick={() => removeSkill(s)} type="button">×</button></span>
                        ))}
                        <div className={styles.suggestWrap}>
                            <div className={styles.inputRow}>
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
                    </div>
                    <div className={styles.filterBox}>
                        {selectedQualities.map(q => (
                            <span key={q} className={styles.filterChip}>{q}<button className={styles.filterChipRemove} onClick={() => removeQuality(q)} type="button">×</button></span>
                        ))}
                        <div className={styles.suggestWrap}>
                            <div className={styles.inputRow}>
                                <input
                                    className={styles.inputInline}
                                    placeholder="Качество..."
                                    value={qualityQ}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setQualityQ(v);
                                        const q = v.trim().toLowerCase();
                                        setQualSug(q ? qualitiesAll.filter(s => s.toLowerCase().includes(q)).slice(0, 20) : []);
                                    }}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && qualityQ.trim()) { addQuality(qualityQ.trim()); e.preventDefault(); } }}
                                    onBlur={() => setQualSug([])}
                                />
                                <button type="button" className={styles.addBtn} onClick={() => qualityQ.trim() && addQuality(qualityQ.trim())}>Добавить</button>
                            </div>
                            {qualSug.length > 0 ? (
                                <div className={styles.suggestions}>
                                    {qualSug.map(s => (
                                        <div key={s} className={styles.suggestionItem} onMouseDown={(e) => { e.preventDefault(); addQuality(s); }}>{s}</div>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
            
            <PageTransition 
                isLoading={loading} 
                loadingComponent={<LoadingSkeleton type="team-card" count={6} />}
                minHeight="400px"
            >
                <div className={styles.teams_grid}>
                {Array.isArray(teams) && teams.map((team) => (
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
                            {team.members.filter(member => member.status === 'APPROVED').length > 0 ? (
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

                        {isAuth && team.creator !== isAuth.username && !team.members.some(member => member.user === isAuth.username && member.status === 'APPROVED') && (
                            <button 
                                className={styles.join_button}
                                onClick={() => handleJoinTeam(team)}
                            >
                                Подать заявку
                            </button>
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
