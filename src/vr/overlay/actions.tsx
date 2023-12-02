import { MouseEventHandler, ReactNode } from 'react';
import { bem } from '@wgt3d/fr-bem';
import './actions.sass';

const {block, el} = bem('actions');

export interface ShootLineProps {
    onClick?: MouseEventHandler<HTMLButtonElement>;
}

export function Actions({onClick}: ShootLineProps): ReactNode {
    return <>
        <div className={block()}>
            <div><button onClick={onClick}>Shoot line</button></div>
            <div><button onClick={onClick}>Delete all lines</button></div>
            <div><button onClick={onClick}>Confirm position</button></div>
        </div>
    </>;
}
