import React, { forwardRef } from 'react';
import { Options } from '../types';
import { useWhyRender } from '../hooks/useWhyRender';

export function withWhyRender<TProps extends object>(
    Component: React.ComponentType<TProps>,
    options?: Options
): React.FC<TProps> {
    const WrappedComponent = forwardRef<any, TProps>((props, ref) => {
        const componentName = Component.displayName || Component.name || 'Component';
        useWhyRender(props, componentName, options);

        return <Component {...props as any} ref={ref} />;
    });

    WrappedComponent.displayName = `withWhyRender(${Component.displayName || Component.name || 'Component'})`;
    return WrappedComponent as unknown as React.FC<TProps>;
}
