import React, { useEffect, useMemo, useState } from "react";
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

    const getFiltered = (sourceArray, query) => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return sourceArray
            .filter((name) => name.toLowerCase().includes(q))
            .slice(0, 8);
    };

    const addSkill = (name) => {
        if (!name) return;
        if (!skillsLowerSet.has(name.toLowerCase())) return;
        if (selectedSkills.some((s) => s.toLowerCase() === name.toLowerCase())) return;
        const canonical = skillsOriginal.find((x) => x.toLowerCase() === name.toLowerCase()) || name;
        setSelectedSkills((prev) => [...prev, canonical]);
        setSkillQuery("");
        setSkillSuggestions([]);
    };

    const removeSkill = (name) => {
        setSelectedSkills((prev) => prev.filter((s) => s.toLowerCase() !== name.toLowerCase()));
    };

    const addQuality = (name) => {
        if (!name) return;
        if (!qualitiesLowerSet.has(name.toLowerCase())) return;
        if (selectedQualities.some((q) => q.toLowerCase() === name.toLowerCase())) return;
        const canonical = qualitiesOriginal.find((x) => x.toLowerCase() === name.toLowerCase()) || name;
        setSelectedQualities((prev) => [...prev, canonical]);
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
                                const v = e.target.value;
                                setSkillQuery(v);
                                setSkillSuggestions(getFiltered(skillsOriginal, v));
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === "Tab") {
                                    e.preventDefault();
                                    if (skillQuery.trim()) {
                                        // пробуем добавить точное совпадение по вводу
                                        if (skillsLowerSet.has(skillQuery.trim().toLowerCase())) {
                                            addSkill(skillQuery.trim());
                                        } else if (skillSuggestions.length > 0) {
                                            addSkill(skillSuggestions[0]);
                                        }
                                    } else if (skillSuggestions.length > 0) {
                                        addSkill(skillSuggestions[0]);
                                    }
                                } else if (e.key === "Backspace" && !skillQuery && selectedSkills.length > 0) {
                                    removeSkill(selectedSkills[selectedSkills.length - 1]);
                                }
                            }}
                            onBlur={() => {
                                const v = skillQuery.trim();
                                if (!v) return;
                                if (skillsLowerSet.has(v.toLowerCase())) addSkill(v);
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
                                const v = e.target.value;
                                setQualityQuery(v);
                                setQualitySuggestions(getFiltered(qualitiesOriginal, v));
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === "Tab") {
                                    e.preventDefault();
                                    if (qualityQuery.trim()) {
                                        if (qualitiesLowerSet.has(qualityQuery.trim().toLowerCase())) {
                                            addQuality(qualityQuery.trim());
                                        } else if (qualitySuggestions.length > 0) {
                                            addQuality(qualitySuggestions[0]);
                                        }
                                    } else if (qualitySuggestions.length > 0) {
                                        addQuality(qualitySuggestions[0]);
                                    }
                                } else if (e.key === "Backspace" && !qualityQuery && selectedQualities.length > 0) {
                                    removeQuality(selectedQualities[selectedQualities.length - 1]);
                                }
                            }}
                            onBlur={() => {
                                const v = qualityQuery.trim();
                                if (!v) return;
                                if (qualitiesLowerSet.has(v.toLowerCase())) addQuality(v);
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


