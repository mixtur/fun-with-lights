import { Component } from 'react';
import { PoseMessage } from './pose-message.tsx';
import { LinesList, LinesListProps } from './lines-list.tsx';
import { OverlayLine } from './types.ts';
import { Actions, ShootLineProps } from './actions.tsx';

export interface VRExternalState {
    hasViewerPose?: boolean;
    linesList?: OverlayLine[];
}

export interface VROverlayConfig {
    onSelectLine?: LinesListProps['onSelectLine'];
    onShootLine?: ShootLineProps['onClick'];
}

export interface VROverlayProps extends VRExternalState, VROverlayConfig {
}

export class VROverlay extends Component<VROverlayProps> {
    static defaultProps = {
        hasViewerPose: false,
        linesList: []
    };


    render() {
        if (!this.props.hasViewerPose) {
            return (
                <PoseMessage />
            );
        }
        return <>
            <LinesList lines={this.props.linesList!}
                       onSelectLine={this.props.onSelectLine} />
            <Actions onClick={this.props.onShootLine} />
        </>;
    }
}