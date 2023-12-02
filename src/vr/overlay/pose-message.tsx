import { ReactNode } from 'react';
import './pose-message.sass';

export function PoseMessage(): ReactNode {
    return <div className={'pose-message'}>Cannot determine viewer pose. Move the device around</div>;
}
