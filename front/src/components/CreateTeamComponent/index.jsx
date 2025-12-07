import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config.js";
import styles from "./style.module.css";
import LoadingSpinner from "../LoadingSpinner/index.jsx";
import ErrorDisplay from "../ErrorDisplay/index.jsx";
import { useAuth } from "../../hooks/useAuth";

export default function CreateTeamComponent() {
    const navigate = useNavigate();
    const { tokens } = useAuth();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [skillQuery, setSkillQuery] = useState("");
    const [qualityQuery, setQualityQuery] = useState("");
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedQualities, setSelectedQualities] = useState([]);
    const [skillSuggestions, setSkillSuggestions] = useState([]);
    const [qualitySuggestions, setQualitySuggestions] = useState([]);

    const [categories, setCategories] = useState([]);
    const [skillsOriginal, setSkillsOriginal] = useState([]);
    const [qualitiesOriginal, setQualitiesOriginal] = useState([]);
    const [skillsLowerSet, setSkillsLowerSet] = useState(new Set());
    const [qualitiesLowerSet, setQualitiesLowerSet] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const skillSearchControllerRef = useRef(null);
    const qualitySearchControllerRef = useRef(null);

    const headers = useMemo(() => {
        const hdrs = { "Content-Type": "application/json" };
        if (tokens?.access) {
            hdrs.Authorization = `Bearer ${tokens.access}`;
        }
        return hdrs;
    }, [tokens]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [cats, sk, ql] = await Promise.all([
                    axios.get(`${API_URL}project-categories/`, { headers }),
                    axios.get(`${API_URL}skills/`),
                    axios.get(`${API_URL}personal-qualities/`),
                ]);
                
                // Обрабатываем ответы - могут быть массивы или объекты с пагинацией
                const categoriesData = Array.isArray(cats.data) ? cats.data : (cats.data?.results || []);
                const skillsData = Array.isArray(sk.data) ? sk.data : (sk.data?.results || []);
                const qualitiesData = Array.isArray(ql.data) ? ql.data : (ql.data?.results || []);
                
                setCategories(categoriesData);
                const skillsArr = Array.isArray(skillsData) ? skillsData.map((s) => s.name) : [];
                const qualitiesArr = Array.isArray(qualitiesData) ? qualitiesData.map((q) => q.name) : [];
                setSkillsOriginal(skillsArr);
                setQualitiesOriginal(qualitiesArr);
                setSkillsLowerSet(new Set(Array.isArray(skillsArr) ? skillsArr.map((x) => x.toLowerCase()) : []));
                setQualitiesLowerSet(new Set(Array.isArray(qualitiesArr) ? qualitiesArr.map((x) => x.toLowerCase()) : []));
            } catch (e) {
                console.error(e);
                setLoadError(e);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [headers]);

    // Поиск навыков через API с дебаунсом
    useEffect(() => {
        const q = skillQuery.trim();
        if (q.length < 1) {
            setSkillSuggestions([]);
            if (skillSearchControllerRef.current) {
                skillSearchControllerRef.current.abort();
            }
            return;
        }
        if (skillSearchControllerRef.current) {
            skillSearchControllerRef.current.abort();
        }
        const timeoutId = setTimeout(() => {
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
                setSkillSuggestions(filtered);
            }).catch((err) => {
                if (err.name !== 'AbortError' && err.code !== 'ERR_CANCELED') {
                    // Fallback на локальный поиск
                    const filtered = Array.isArray(skillsOriginal) ? skillsOriginal
                        .filter(s => s.toLowerCase().includes(q.toLowerCase()))
                        .slice(0, 20) : [];
                    setSkillSuggestions(filtered);
                }
            });
        }, 300);
        return () => {
            clearTimeout(timeoutId);
            if (skillSearchControllerRef.current) {
                skillSearchControllerRef.current.abort();
            }
        };
    }, [skillQuery, skillsOriginal]);

    // Поиск качеств через API с дебаунсом
    useEffect(() => {
        const q = qualityQuery.trim();
        if (q.length < 1) {
            setQualitySuggestions([]);
            if (qualitySearchControllerRef.current) {
                qualitySearchControllerRef.current.abort();
            }
            return;
        }
        if (qualitySearchControllerRef.current) {
            qualitySearchControllerRef.current.abort();
        }
        const timeoutId = setTimeout(() => {
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
                setQualitySuggestions(filtered);
            }).catch((err) => {
                if (err.name !== 'AbortError' && err.code !== 'ERR_CANCELED') {
                    // Fallback на локальный поиск
                    const filtered = Array.isArray(qualitiesOriginal) ? qualitiesOriginal
                        .filter(s => s.toLowerCase().includes(q.toLowerCase()))
                        .slice(0, 20) : [];
                    setQualitySuggestions(filtered);
                }
            });
        }, 300);
        return () => {
            clearTimeout(timeoutId);
            if (qualitySearchControllerRef.current) {
                qualitySearchControllerRef.current.abort();
            }
        };
    }, [qualityQuery, qualitiesOriginal]);

    const addSkill = (name) => {
        if (!name) return;
        const nameLower = name.toLowerCase();
        if (selectedSkills.some((s) => s.toLowerCase() === nameLower)) return;
        
        // Проверяем, есть ли навык в оригинальном списке или в подсказках
        const existsInOriginal = skillsOriginal.find(s => s.toLowerCase() === nameLower);
        const existsInSuggestions = skillSuggestions.find(s => s.toLowerCase() === nameLower);
        
        if (existsInOriginal) {
            setSelectedSkills((prev) => [...prev, existsInOriginal]);
        } else if (existsInSuggestions) {
            setSelectedSkills((prev) => [...prev, existsInSuggestions]);
        } else {
            // Если не найден, не добавляем
            return;
        }
        setSkillQuery("");
        setSkillSuggestions([]);
    };

    const removeSkill = (name) => {
        setSelectedSkills((prev) => prev.filter((s) => s.toLowerCase() !== name.toLowerCase()));
    };

    const addQuality = (name) => {
        if (!name) return;
        const nameLower = name.toLowerCase();
        if (selectedQualities.some((q) => q.toLowerCase() === nameLower)) return;
        
        // Проверяем, есть ли качество в оригинальном списке или в подсказках
        const existsInOriginal = qualitiesOriginal.find(q => q.toLowerCase() === nameLower);
        const existsInSuggestions = qualitySuggestions.find(q => q.toLowerCase() === nameLower);
        
        if (existsInOriginal) {
            setSelectedQualities((prev) => [...prev, existsInOriginal]);
        } else if (existsInSuggestions) {
            setSelectedQualities((prev) => [...prev, existsInSuggestions]);
        } else {
            // Если не найдено, не добавляем
            return;
        }
        setQualityQuery("");
        setQualitySuggestions([]);
    };

    const removeQuality = (name) => {
        setSelectedQualities((prev) => prev.filter((q) => q.toLowerCase() !== name.toLowerCase()));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!tokens?.access) {
            setError("Требуется вход в систему.");
            return;
        }

        if (!title || !description || !category) {
            setError("Заполните обязательные поля: название, описание, категория.");
            return;
        }

        const skillsCanonical = selectedSkills;
        const qualitiesCanonical = selectedQualities;

        const payload = {
            title,
            description,
            category, // SlugRelatedField by name
            required_skills: skillsCanonical,
            required_qualities: qualitiesCanonical,
        };

        try {
            setSubmitting(true);
            await axios.post(`${API_URL}teams/`, payload, { headers });
            navigate("/teams");
        } catch (e) {
            console.error(e);
            const data = e?.response?.data;
            if (data && typeof data === 'object') {
                const fieldErrors = [];
                Object.keys(data).forEach((key) => {
                    const val = data[key];
                    if (Array.isArray(val)) {
                        fieldErrors.push(`${key}: ${val.join(', ')}`);
                    } else if (typeof val === 'string') {
                        fieldErrors.push(`${key}: ${val}`);
                    }
                });
                if (fieldErrors.length > 0) {
                    setError(fieldErrors.join("\n"));
                } else {
                    const detail = data?.detail || data?.message;
                    setError(detail || "Не удалось создать команду. Проверьте данные и попробуйте снова.");
                }
            } else {
                setError("Не удалось создать команду. Проверьте данные и попробуйте снова.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loadError) {
        return (
            <div className={styles.wrapper}>
                <ErrorDisplay
                    error={loadError}
                    title="Ошибка загрузки данных"
                    onRetry={() => {
                        setLoadError(null);
                        setLoading(true);
                    }}
                    fullScreen={false}
                />
            </div>
        );
    }

    if (loading) {
        return <LoadingSpinner text="Загрузка..." />;
    }

    return (
        <div className={styles.wrapper}>
            <h1 className={styles.heading}>Создать команду</h1>
            <form className={styles.form} onSubmit={handleSubmit}>
                {error ? <div className={styles.error}>{error}</div> : null}

                <label className={styles.label}>
                    Название
                    <input
                        className={styles.input}
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Название проекта"
                    />
                </label>

                <label className={styles.label}>
                    Описание
                    <textarea
                        className={styles.textarea}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Кратко опишите идею и цели"
                        rows={6}
                    />
                </label>

                <label className={styles.label}>
                    Категория
                    <select
                        className={styles.select}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">Выберите категорию</option>
                        {Array.isArray(categories) && categories.map((c) => (
                            <option key={c.id} value={c.name}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </label>

                <label className={styles.label}>
                    Требуемые навыки
                    {selectedSkills.length > 0 ? (
                        <div className={styles.selectedRow}>
                        {selectedSkills.map((s) => (
                            <span key={s} className={styles.chip}>
                                <span className={styles.chipLabel}>{s}</span>
                                <button
                                    type="button"
                                    className={styles.chipRemove}
                                    aria-label={`Удалить ${s}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeSkill(s);
                                    }}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                        </div>
                    ) : null}
                    <div className={styles.chipContainer}>
                        <input
                            className={styles.inputInline}
                            type="text"
                            value={skillQuery}
                            onChange={(e) => {
                                setSkillQuery(e.target.value);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === "Tab") {
                                    e.preventDefault();
                                    if (skillQuery.trim() && skillSuggestions.length > 0) {
                                        addSkill(skillSuggestions[0]);
                                    } else if (skillQuery.trim()) {
                                        // Пробуем найти точное совпадение
                                        const found = skillsOriginal.find(s => s.toLowerCase() === skillQuery.trim().toLowerCase()) ||
                                                     skillSuggestions.find(s => s.toLowerCase() === skillQuery.trim().toLowerCase());
                                        if (found) {
                                            addSkill(found);
                                        }
                                    }
                                } else if (e.key === "Backspace" && !skillQuery && selectedSkills.length > 0) {
                                    removeSkill(selectedSkills[selectedSkills.length - 1]);
                                }
                            }}
                            onBlur={() => {
                                const v = skillQuery.trim();
                                if (!v) return;
                                const found = skillsOriginal.find(s => s.toLowerCase() === v.toLowerCase()) ||
                                             skillSuggestions.find(s => s.toLowerCase() === v.toLowerCase());
                                if (found) {
                                    addSkill(found);
                                }
                            }}
                            placeholder="Начните вводить навык..."
                        />
                    </div>
                    {skillSuggestions.length > 0 ? (
                        <div className={styles.suggestions}>
                            {skillSuggestions.map((s) => (
                                <div
                                    key={s}
                                    className={styles.suggestionItem}
                                    onMouseDown={(e) => {
                                        e.preventDefault(); // предотвратить blur до добавления
                                        addSkill(s);
                                    }}
                                >
                                    {s}
                                </div>
                            ))}
                        </div>
                    ) : null}
                    <span className={styles.hint}>Выбирайте из существующих навыков.</span>
                </label>

                <label className={styles.label}>
                    Требуемые личные качества
                    {selectedQualities.length > 0 ? (
                        <div className={styles.selectedRow}>
                        {selectedQualities.map((q) => (
                            <span key={q} className={styles.chip}>
                                <span className={styles.chipLabel}>{q}</span>
                                <button
                                    type="button"
                                    className={styles.chipRemove}
                                    aria-label={`Удалить ${q}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeQuality(q);
                                    }}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                        </div>
                    ) : null}
                    <div className={styles.chipContainer}>
                        <input
                            className={styles.inputInline}
                            type="text"
                            value={qualityQuery}
                            onChange={(e) => {
                                setQualityQuery(e.target.value);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === "Tab") {
                                    e.preventDefault();
                                    if (qualityQuery.trim() && qualitySuggestions.length > 0) {
                                        addQuality(qualitySuggestions[0]);
                                    } else if (qualityQuery.trim()) {
                                        // Пробуем найти точное совпадение
                                        const found = qualitiesOriginal.find(q => q.toLowerCase() === qualityQuery.trim().toLowerCase()) ||
                                                     qualitySuggestions.find(q => q.toLowerCase() === qualityQuery.trim().toLowerCase());
                                        if (found) {
                                            addQuality(found);
                                        }
                                    }
                                } else if (e.key === "Backspace" && !qualityQuery && selectedQualities.length > 0) {
                                    removeQuality(selectedQualities[selectedQualities.length - 1]);
                                }
                            }}
                            onBlur={() => {
                                const v = qualityQuery.trim();
                                if (!v) return;
                                const found = qualitiesOriginal.find(q => q.toLowerCase() === v.toLowerCase()) ||
                                             qualitySuggestions.find(q => q.toLowerCase() === v.toLowerCase());
                                if (found) {
                                    addQuality(found);
                                }
                            }}
                            placeholder="Начните вводить качество..."
                        />
                    </div>
                    {qualitySuggestions.length > 0 ? (
                        <div className={styles.suggestions}>
                            {qualitySuggestions.map((q) => (
                                <div
                                    key={q}
                                    className={styles.suggestionItem}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        addQuality(q);
                                    }}
                                >
                                    {q}
                                </div>
                            ))}
                        </div>
                    ) : null}
                    <span className={styles.hint}>Выбирайте из существующих качеств.</span>
                </label>

                <div className={styles.actions}>
                    <button className={styles.button} type="submit" disabled={submitting} style={{ position: 'relative', minHeight: '40px' }}>
                        {submitting ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <LoadingSpinner size="small" text="" fullScreen={false} />
                                <span>Создание...</span>
                            </span>
                        ) : "Создать"}
                    </button>
                    <button
                        className={styles.buttonSecondary}
                        type="button"
                        onClick={() => navigate(-1)}
                    >
                        Отмена
                    </button>
                </div>
            </form>
        </div>
    );
}


