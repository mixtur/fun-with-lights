import { Component } from 'react';
import { PoseMessage } from './pose-message.tsx';
import { OverlayLine } from './types.ts';
import { Actions, ActionProps } from './actions.tsx';

export interface VRExternalState {
    hasViewerPose?: boolean;
    isPositionEmulated?: boolean;
    linesList?: OverlayLine[];
}

export interface VROverlayConfig {
    onShootLine?: ActionProps['onShoot'];
    onRestart?: ActionProps['onRestart'];
    onConfirm?: ActionProps['onConfirm'];
}

export interface VROverlayProps extends VRExternalState, VROverlayConfig {
}

export class VROverlay extends Component<VROverlayProps> {
    static defaultProps = {
        hasViewerPose: false,
        isPositionEmulated: false,
        linesList: []
    };


    render() {
        if (!this.props.hasViewerPose || this.props.isPositionEmulated) {
            return (
                <PoseMessage isPositionEmulated={this.props.isPositionEmulated!} />
            );
        }
        return <>
{/*
            <LinesList lines={this.props.linesList!}
                       onSelectLine={this.props.onSelectLine} />
*/}
            <Actions onShoot={this.props.onShootLine}
                     onRestart={this.props.onRestart}
                     onConfirm={this.props.onConfirm}/>
        </>;
    }
}
