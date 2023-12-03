import { ReactNode } from 'react';
import './pose-message.sass';

export interface PoseMessageProps {
    isPositionEmulated: boolean;
}

export function PoseMessage({isPositionEmulated}: PoseMessageProps): ReactNode {
    const message = isPositionEmulated
        ? 'Position is emulated'
        : 'Cannot determine viewer pose';
    return <div className={'pose-message'}>{message}. Move the device around</div>;
}
