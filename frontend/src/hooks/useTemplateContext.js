import { useContext } from 'react';
import { TemplateContext } from '../contexts/TemplateContext';

const useTemplateContext = () => {
    const context = useContext(TemplateContext);

    if (!context) {
        throw new Error('useTemplateContext must be used within a TemplateProvider');
    }

    return context;
};

export { useTemplateContext };
