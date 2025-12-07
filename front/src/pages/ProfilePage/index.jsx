import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./style.module.css";
import { PencilLine } from "lucide-react";
import EditSkillsModalComponent from "../../components/EditSkillsModalComponent/index.jsx";
import EditProfileModalComponent from "../../components/EditProfileModalComponent/index.jsx";
import LoadingSpinner from "../../components/LoadingSpinner/index.jsx";
import ErrorDisplay from "../../components/ErrorDisplay/index.jsx";
import { API_URL } from "@/config";
import { useAuth } from "../../hooks/useAuth";



function ProfilePage() {
    const { tokens, logout } = useAuth();
    const access = tokens?.access;
    const [profile, setProfile] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showLeftModal, setShowLeftModal] = useState(false);
    const [error, setError] = useState(null);


    const handleLogout = () => {
        logout();
    };


    useEffect(() => {
        if (!access) return;
        axios.get(`${API_URL}profile/`, {
            headers: {Authorization: `Bearer ${access}`}
        })
            .then(res => {
                setProfile(res.data);
                setError(null);
            })
            .catch(err => {
                console.error("Ошибка загрузки профиля:", err);
                setError(err);
            });
    }, [access]);

    if (error) {
        return (
            <div className={styles.profile_page}>
                <ErrorDisplay
                    error={error}
                    title="Ошибка загрузки профиля"
                    onRetry={() => {
                        setError(null);
                        setProfile(null);
                    }}
                    fullScreen={false}
                />
            </div>
        );
    }

    if (!profile) return <LoadingSpinner text="Загрузка профиля..." />;

    return (
        <div className={styles.profile_page}>
            <div className={styles.profile_left}>
                <PencilLine
                    className={styles.edit_icon}
                    size={20}
                    onClick={() => setShowLeftModal(true)}
                />
                <div className={styles.profile_avatar}>
                    <img
                        src={profile.avatar || "https://www.iccaconsortium.org/wp-content/uploads/2017/05/blank-profile-picture-973460_1280.png"}
                        alt="Аватар"
                    />
                </div>
                <div className={styles.profile_left_block1}>
                    <div className="username">
                        @{profile.username}
                    </div>
                    <div className={styles.last_first_name}>
                        {profile.first_name && profile.last_name ?
                            `${profile.first_name} ${profile.last_name}` :
                            "Имя фамилия"
                        }
                    </div>
                    <div className={styles.position}>
                        {profile.position ? `${profile.position}` : "Должность не указана"}
                    </div>
                </div>

                <div className={styles.profile_left_block2}>
                    <div className={styles.block}>
                        <div className={styles.st1}>курс:</div>
                        <div className={styles.st2}>
                            {profile.education_level && profile.course ?
                                `${profile.education_level_display} ${profile.course}` :
                                "Отсуствует"
                            }
                        </div>
                    </div>
                    <div className={styles.block}>
                        <div className={styles.st1}>факультет:</div>
                        <div className={styles.st2}>
                            {profile.faculty ?
                                `${profile.faculty.name}` :
                                "Отсуствует"
                            }
                        </div>
                    </div>
                    <div className={styles.block}>
                        <div className={styles.st1}>email:</div>
                        <div className={styles.st2}>
                            {profile.email}
                        </div>
                    </div>

                    <button onClick={handleLogout}>
                        выйти
                    </button>
                </div>

            </div>

            <div className={styles.profile_right}>
                <PencilLine className={styles.edit_icon} size={20} onClick={() => setShowModal(true)} />
                <div className={styles.block}>
                    <div className={styles.title}>Навыки</div>
                    <div className={styles.skills}>
                        {profile.skills_list.length > 0 ? (
                            profile.skills_list.map((s, i) => (
                                <span key={i} className={styles.tag}>{s}</span>
                            ))
                        ) : (
                            <p>Навыки не добавлены</p>
                        )}
                    </div>
                </div>

                <div className={styles.block}>
                    <div className={styles.title}>Личные качества</div>
                    <div className={styles.qualities}>
                        {profile.personal_qualities_list.length > 0 ? (
                            profile.personal_qualities_list.map((q, i) => (
                                <span key={i} className={styles.tag}>{q}</span>
                            ))
                        ) : (
                            <p>Качества не добавлены</p>
                        )}
                    </div>
                </div>
                <div className={styles.block_about}>
                    <div className={styles.title}>О себе</div>
                    <div className={styles.about_myself}>
                        {profile.about_myself ? (profile.about_myself) :
                        "..."}
                    </div>
                </div>

                
            </div>

            {showModal && (
                <EditSkillsModalComponent
                    profile={profile}
                    access={access}
                    onClose={() => setShowModal(false)}
                    onSave={(updatedProfile) => setProfile(updatedProfile)}
                />
            )}
            {showLeftModal && (
                <EditProfileModalComponent
                    profile={profile}
                    access={access}
                    onClose={() => setShowLeftModal(false)}
                    onSave={(updatedProfile) => setProfile(updatedProfile)}
                />
            )}

        </div>
    );
}

export default ProfilePage;
