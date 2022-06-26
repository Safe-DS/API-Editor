import { useToast } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useAppSelector } from '../../app/hooks';
import {
    selectNumberOfAnnotationsChanged,
    selectNumberOfAnnotationsCreated,
    selectNumberOfAnnotationsDeleted,
    selectNumberOfAnnotationsMarkedAsCorrect,
    selectNumberOfElementsMarkedAsComplete,
} from '../annotations/annotationSlice';

export const useAnnotationToasts = () => {
    const toast = useToast();


    const authorCount = useAppSelector(selectNumberOfAnnotationsCreated);
    const cleanerCount = useAppSelector(selectNumberOfAnnotationsDeleted);
    const completionistCount = useAppSelector(selectNumberOfElementsMarkedAsComplete);
    const editorCount = useAppSelector(selectNumberOfAnnotationsChanged);

    const auditorCount = useAppSelector(selectNumberOfAnnotationsMarkedAsCorrect);
    useEffect(() => {
        toast({
            title: 'Annotations created',
            description: `${authorCount}`,
            status: 'success',
        });
    }, [auditorCount]);
}



const AnnotationToast: React.FC = () => {

}
