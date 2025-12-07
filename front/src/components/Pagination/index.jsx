import styles from "./style.module.css";

function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            // Показываем все страницы, если их немного
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Показываем первую страницу, последнюю и несколько вокруг текущей
            if (currentPage <= 3) {
                // В начале списка
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                // В конце списка
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // В середине списка
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

    const pages = getPageNumbers();

    return (
        <div className={styles.pagination}>
            <button
                className={styles.paginationButton}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Предыдущая страница"
            >
                ‹
            </button>
            
            {pages.map((page, index) => {
                if (page === '...') {
                    return (
                        <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                            ...
                        </span>
                    );
                }
                
                return (
                    <button
                        key={page}
                        className={`${styles.paginationButton} ${currentPage === page ? styles.active : ''}`}
                        onClick={() => onPageChange(page)}
                        aria-label={`Страница ${page}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                    >
                        {page}
                    </button>
                );
            })}
            
            <button
                className={styles.paginationButton}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Следующая страница"
            >
                ›
            </button>
        </div>
    );
}

export default Pagination;

