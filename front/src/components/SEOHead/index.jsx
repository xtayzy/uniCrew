import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SEOHead = ({ title, description, keywords, ogImage }) => {
    const location = useLocation();
    const baseUrl = "https://unicrew.kz";
    const currentUrl = `${baseUrl}${location.pathname}`;
    
    const defaultTitle = "UniCrew.kz — Найди команду для студенческих проектов | Хакатоны, Дипломы, Стартапы";
    const defaultDescription = "UniCrew.kz — платформа для поиска команды студентам. Найди участников для дипломных работ, хакатонов, стартапов и учебных проектов. Бесплатная регистрация.";
    const defaultImage = `${baseUrl}/logo_unicrew.jpg`;
    
    useEffect(() => {
        // Update document title
        document.title = title || defaultTitle;
        
        // Update or create meta tags
        const updateMetaTag = (name, content, attribute = "name") => {
            let element = document.querySelector(`meta[${attribute}="${name}"]`);
            if (!element) {
                element = document.createElement("meta");
                element.setAttribute(attribute, name);
                document.head.appendChild(element);
            }
            element.setAttribute("content", content);
        };
        
        // Primary meta tags
        updateMetaTag("title", title || defaultTitle);
        updateMetaTag("description", description || defaultDescription);
        if (keywords) {
            updateMetaTag("keywords", keywords);
        }
        
        // Open Graph tags
        updateMetaTag("og:title", title || defaultTitle, "property");
        updateMetaTag("og:description", description || defaultDescription, "property");
        updateMetaTag("og:url", currentUrl, "property");
        updateMetaTag("og:image", ogImage || defaultImage, "property");
        updateMetaTag("og:image:secure_url", ogImage || defaultImage, "property");
        updateMetaTag("og:image:type", "image/png", "property");
        updateMetaTag("og:image:alt", title || defaultTitle, "property");
        
        // Twitter Card tags
        updateMetaTag("twitter:card", "summary_large_image", "name");
        updateMetaTag("twitter:url", currentUrl, "name");
        updateMetaTag("twitter:title", title || defaultTitle, "name");
        updateMetaTag("twitter:description", description || defaultDescription, "name");
        updateMetaTag("twitter:image", ogImage || defaultImage, "name");
        updateMetaTag("twitter:image:alt", title || defaultTitle, "name");
        
        // Canonical URL
        let canonical = document.querySelector("link[rel='canonical']");
        if (!canonical) {
            canonical = document.createElement("link");
            canonical.setAttribute("rel", "canonical");
            document.head.appendChild(canonical);
        }
        canonical.setAttribute("href", currentUrl);
    }, [title, description, keywords, ogImage, currentUrl, defaultTitle, defaultDescription, defaultImage]);
    
    return null;
};

export default SEOHead;

