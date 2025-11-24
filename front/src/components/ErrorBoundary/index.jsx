import React, { Component } from 'react';
import ErrorDisplay from '../ErrorDisplay';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false, 
            error: null,
            errorInfo: null 
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    handleRetry = () => {
        this.setState({ 
            hasError: false, 
            error: null,
            errorInfo: null 
        });
    };

    handleClose = () => {
        this.setState({ 
            hasError: false, 
            error: null,
            errorInfo: null 
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <ErrorDisplay
                    error={this.state.error}
                    title="Ошибка приложения"
                    onRetry={this.handleRetry}
                    onClose={this.handleClose}
                    fullScreen={this.props.fullScreen !== false}
                />
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
