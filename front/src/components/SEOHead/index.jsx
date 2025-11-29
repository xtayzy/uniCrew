import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SEOHead = ({ title, description, keywords, ogImage }) => {
    const location = useLocation();
    const baseUrl = "https://unicrew.kz";
    const currentUrl = `${baseUrl}${location.pathname}`;
    
    const defaultTitle = "UniCrew — Платформа для поиска команды студенческих проектов";
    const defaultDescription = "Найди свою идеальную команду для учебных проектов, дипломных работ, хакатонов и стартапов. UniCrew помогает студентам находить единомышленников с нужными навыками.";
    const defaultImage = `${baseUrl}/unicrew_logo_2.png`;
    
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
        
        // Twitter Card tags
        updateMetaTag("twitter:title", title || defaultTitle, "property");
        updateMetaTag("twitter:description", description || defaultDescription, "property");
        updateMetaTag("twitter:image", ogImage || defaultImage, "property");
        
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

