import React from 'react';
import type { AppRouterInstance } from '../../shared/lib/app-router-context.shared-runtime';
import { type RedirectType } from './redirect-error';
interface RedirectBoundaryProps {
    router: AppRouterInstance;
    children: React.ReactNode;
    isActive?: boolean;
}
export declare class RedirectErrorBoundary extends React.Component<RedirectBoundaryProps, {
    redirect: string | null;
    redirectType: RedirectType | null;
}> {
    constructor(props: RedirectBoundaryProps);
    static getDerivedStateFromError(error: any): {
        redirect: null;
        redirectType: null;
    } | {
        redirect: string;
        redirectType: RedirectType;
    };
    componentDidUpdate(): void;
    render(): React.ReactNode;
}
export declare function RedirectBoundary({ children, isActive }: {
    children: React.ReactNode;
    isActive?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export {};
