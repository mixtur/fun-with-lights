import { MouseEventHandler, ReactNode } from 'react';
import { bem } from '@wgt3d/fr-bem';
import './actions.sass';

const {block} = bem('actions');

export interface ActionProps {
    onShoot?: MouseEventHandler<HTMLButtonElement>;
    onRestart?: MouseEventHandler<HTMLButtonElement>;
    onConfirm?: MouseEventHandler<HTMLButtonElement>;
}

export function Actions({onShoot, onRestart, onConfirm}: ActionProps): ReactNode {
    return <>
        <button className={block('shoot')} onClick={onShoot}>Shoot line</button>
        <button className={block('restart')} onClick={onRestart}>Delete all lines</button>
        <button className={block('confirm')} onClick={onConfirm}>Next point</button>
    </>;
}
