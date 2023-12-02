import { ReactNode, useState } from 'react';
import { OverlayLine } from './types.ts';
import {bem} from '@wgt3d/fr-bem';
import './lines-list.sass';

const {block, el} = bem('lines-list');

export interface LinesListProps {
    lines: OverlayLine[];
    onSelectLine?: (lineIndex: number) => void;
}

export function LinesList({lines, onSelectLine}: LinesListProps): ReactNode {
    const [selectedLine, setSelectedLine] = useState(-1);

    return <div className={block()}>
        {lines.map((line, i) => {
            return (
                <div className={el('item')} key={i}>
                    <div className={el('item-label', {'selected': selectedLine === i})}
                         onClick={() => {
                             setSelectedLine(i);
                             if (onSelectLine) {
                                 onSelectLine(i);
                             }
                         }}>Line {i}</div>
                </div>
            );
        })}
    </div>;
}

