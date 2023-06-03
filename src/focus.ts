// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();

import * as Geom from 'geom';

import type { ShellWindow } from 'window';
import type { Ext } from './extension';

export enum FocusPosition {
    TopLeft = "Top Left",
    TopRight = "Top Right",
    BottomLeft = "Bottom Left",
    BottomRight = "Bottom Right",
    Center = "Center",
}

export class FocusSelector {
    select(
        ext: Ext,
        direction: (a: ShellWindow, b: Array<ShellWindow>) => Array<ShellWindow>,
        window: ShellWindow | null
    ): ShellWindow | null {
        window = window ?? ext.focus_window();
        if (window) {
            let window_list = ext.active_window_list();
            return top(direction(window, window_list));
        }
        return null;
    }

    down(ext: Ext, window: ShellWindow | null): ShellWindow | null {
        let focused = window ?? ext.focus_window();
        if (focused) {
            let window_list = ext.active_window_list();
            return window_next(focused, window_list);
        }
        return null;
    }

    left(ext: Ext, window: ShellWindow | null): ShellWindow | null {
        return this.select(ext, window_left, window);
    }

    right(ext: Ext, window: ShellWindow | null): ShellWindow | null {
        return this.select(ext, window_right, window);
    }

    up(ext: Ext, window: ShellWindow | null): ShellWindow | null {
        let focused = window ?? ext.focus_window();
        if (focused) {
            let window_list = ext.active_window_list();
            return window_prev(focused, window_list);
        }
        return null;
    }
}

const top = <T>(xs: Array<T>): T | null => xs.length > 0 ? xs[0] : null;

const mod = (a: number, n: number) => ((a % n) + n) % n;

const get_ref = (window: ShellWindow) => {
    let rect = window.meta.get_frame_rect();
    return [rect.x, rect.y];
}

const compare = (a: ShellWindow, b: ShellWindow) => {
    let [ax, ay] = get_ref(a);
    let [bx, by] = get_ref(b);
    let ret = ay - by;
    return ret == 0 ? ax - bx : ret;
}

function window_next(focused: ShellWindow, windows: Array<ShellWindow>) {
    windows = windows
        .filter((win) => !win.meta.minimized)
        .sort(compare);
    let i = windows.findIndex((e) => e == focused) + 1;
    return windows[mod(i, windows.length)];
}

function window_prev(focused: ShellWindow, windows: Array<ShellWindow>) {
    windows = windows
        .filter((win) => !win.meta.minimized)
        .sort(compare);
    let i = windows.findIndex((e) => e == focused) - 1;
    return windows[mod(i, windows.length)];
}

// function window_down(focused: ShellWindow, windows: Array<ShellWindow>) {
//     return windows
//         .filter((win) => !win.meta.minimized && win.meta.get_frame_rect().y > focused.meta.get_frame_rect().y)
//         .sort((a, b) => Geom.downward_distance(a.meta, focused.meta) - Geom.downward_distance(b.meta, focused.meta));
// }

function window_left(focused: ShellWindow, windows: Array<ShellWindow>) {
    return windows
        .filter((win) => !win.meta.minimized && win.meta.get_frame_rect().x < focused.meta.get_frame_rect().x)
        .sort((a, b) => Geom.leftward_distance(a.meta, focused.meta) - Geom.leftward_distance(b.meta, focused.meta));
}

function window_right(focused: ShellWindow, windows: Array<ShellWindow>) {
    return windows
        .filter((win) => !win.meta.minimized && win.meta.get_frame_rect().x > focused.meta.get_frame_rect().x)
        .sort((a, b) => Geom.rightward_distance(a.meta, focused.meta) - Geom.rightward_distance(b.meta, focused.meta));
}

// function window_up(focused: ShellWindow, windows: Array<ShellWindow>) {
//     return windows
//         .filter((win) => !win.meta.minimized && win.meta.get_frame_rect().y < focused.meta.get_frame_rect().y)
//         .sort((a, b) => Geom.upward_distance(a.meta, focused.meta) - Geom.upward_distance(b.meta, focused.meta));
// }
