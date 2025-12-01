import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./style.module.css";
import { API_URL } from "@/config";
import InviteToTeamModal from "../../components/InviteToTeamModal";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";
import { useAuth } from "../../hooks/useAuth";

const UserDetailPage = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { isAuth } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`${API_URL}users/?username=${username}`);
                if (response.data && response.data.length > 0) {
                    setUser(response.data[0]);
                    setError(null);
                } else {
                    setError({ message: 'Пользователь не найден', status: 404 });
                }
            } catch (error) {
                console.error('Ошибка загрузки пользователя:', error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [username]);

    const handleInviteToTeam = () => {
        setIsInviteModalOpen(true);
    };

    const handleCloseInviteModal = () => {
        setIsInviteModalOpen(false);
    };

    const handleInviteSuccess = (message) => {
        alert(message);
    };

    if (error) {
        return (
            <div className={styles.user_detail_page} style={{ padding: '40px 20px' }}>
                <ErrorDisplay
                    error={error}
                    title="Ошибка загрузки профиля"
                    onRetry={() => {
                        setError(null);
                        setLoading(true);
                    }}
                    fullScreen={false}
                />
            </div>
        );
    }

    if (loading) {
        return <LoadingSpinner text="Загрузка профиля..." />;
    }

    if (!user) {
        return (
            <div className={styles.user_detail_page} style={{ padding: '40px 20px' }}>
                <ErrorDisplay
                    error={{ message: 'Пользователь не найден', status: 404 }}
                    title="Пользователь не найден"
                    onRetry={() => window.location.reload()}
                    fullScreen={false}
                />
            </div>
        );
    }

    return (
        <div className={styles.user_detail_page}>
            <div className={styles.header}>
                <button onClick={() => navigate('/users')} className={styles.back_btn}>
                    ← Назад к пользователям
                </button>
                <div className={styles.header_actions}>
                    {isAuth && user.username !== isAuth.username && (
                        <button className={styles.invite_btn} onClick={handleInviteToTeam}>
                            Пригласить в команду
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.user_content}>
                <div className={styles.user_left}>
                    <div className={styles.profile_avatar}>
                        <img
                            src={user.avatar || "https://www.iccaconsortium.org/wp-content/uploads/2017/05/blank-profile-picture-973460_1280.png"}
                            alt="Аватар"
                        />
                    </div>
                    <div className={styles.profile_info}>
                        <div className={styles.username}>
                            @{user.username}
                        </div>
                        <div className={styles.full_name}>
                            {user.first_name && user.last_name ?
                                `${user.first_name} ${user.last_name}` :
                                "Имя фамилия не указаны"
                            }
                        </div>
                        <div className={styles.position}>
                            {user.position ? user.position : "Должность не указана"}
                        </div>
                    </div>

                    <div className={styles.profile_details}>
                        <div className={styles.detail_item}>
                            <div className={styles.detail_label}>Курс:</div>
                            <div className={styles.detail_value}>
                                {user.education_level && user.course ?
                                    `${user.education_level_display} ${user.course}` :
                                    "Не указан"
                                }
                            </div>
                        </div>
                        <div className={styles.detail_item}>
                            <div className={styles.detail_label}>Факультет:</div>
                            <div className={styles.detail_value}>
                                {user.faculty ? user.faculty.name : "Не указан"}
                            </div>
                        </div>
                        <div className={styles.detail_item}>
                            <div className={styles.detail_label}>Email:</div>
                            <div className={styles.detail_value}>
                                {user.email}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.user_right}>
                    <div className={styles.skills_section}>
                        <div className={styles.section_title}>Навыки</div>
                        <div className={styles.skills}>
                            {user.skills_list && user.skills_list.length > 0 ? (
                                user.skills_list.map((skill, index) => (
                                    <span key={index} className={styles.skill_tag}>
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <p className={styles.no_data}>Навыки не добавлены</p>
                            )}
                        </div>
                    </div>

                    <div className={styles.qualities_section}>
                        <div className={styles.section_title}>Личные качества</div>
                        <div className={styles.qualities}>
                            {user.personal_qualities_list && user.personal_qualities_list.length > 0 ? (
                                user.personal_qualities_list.map((quality, index) => (
                                    <span key={index} className={styles.quality_tag}>
                                        {quality}
                                    </span>
                                ))
                            ) : (
                                <p className={styles.no_data}>Качества не добавлены</p>
                            )}
                        </div>
                    </div>

                    <div className={styles.about_section}>
                        <div className={styles.section_title}>О себе</div>
                        <div className={styles.about_text}>
                            {user.about_myself ? user.about_myself : "Информация о себе не указана"}
                        </div>
                    </div>
                </div>
            </div>

            <InviteToTeamModal
                user={user}
                isOpen={isInviteModalOpen}
                onClose={handleCloseInviteModal}
                onSuccess={handleInviteSuccess}
            />
        </div>
    );
};

export default UserDetailPage;
