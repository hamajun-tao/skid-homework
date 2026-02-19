import type {Adb} from '@yume-chan/adb';
import {AdbDaemonWebUsbDevice} from '@yume-chan/adb-daemon-webusb';
import {AdbManager} from './manager';

let _manager: AdbManager | undefined;
let _adbConnection: Adb | undefined;
let selectedDevice: AdbDaemonWebUsbDevice | undefined;

async function _syncSelectedDevice(): Promise<boolean> {
    const devices = await getAdbManager().getDevices();

    if (!devices.length) {
        return false;
    }

    // Keep using the previously chosen device if it's still connected.
    if (selectedDevice) {
        return devices.some(
            (device) => device.serial === selectedDevice!.serial,
        );
    }

    return false;
}

function getAdbManager(): AdbManager {
    if (!_manager) {
        try {
            _manager = new AdbManager();
        } catch (e) {
            console.error("Failed to initialize AdbManager. WebUSB might not be supported.", e);
            throw e;
        }
    }
    return _manager;
}

async function getAdbConnection(): Promise<Adb> {
    let hasConnectedDevice = await _syncSelectedDevice();

    // if user haven't connected a device yet, prompt them to select one.
    // This is needed for the first time usage.
    if (!hasConnectedDevice) {
        const device = await getAdbManager().requestDevice();
        if (!device) {
            throw new Error('WebADB: No device selected');
        }
        selectedDevice = device;
        hasConnectedDevice = await _syncSelectedDevice();
    }

    if (!hasConnectedDevice || !selectedDevice) {
        throw new Error('WebADB: No ADB device connected');
    }

    if (!_adbConnection) {
        _adbConnection = await getAdbManager().connect(selectedDevice);
    }

    try{
        await _adbConnection.subprocess.shellProtocol!.spawn('')
    } catch (e) {
        console.warn('WebADB: ADB connection seems to be broken, resetting connection...', e);
        _adbConnection = await getAdbManager().connect(selectedDevice);
    }

    return _adbConnection;
}

function resetAdbManager() {
    _manager = undefined;
    _adbConnection = undefined;
    selectedDevice = undefined;
}

export async function isAdbDeviceConnected(): Promise<boolean> {
    try {
        return await _syncSelectedDevice();
    } catch (error) {
        console.error('Failed to check ADB device connection', error);
        return false;
    }
}

export async function reconnectAdbDevice(): Promise<boolean> {
    resetAdbManager();
    const device = await getAdbManager().requestDevice();
    if (!device) {
        return false;
    }
    selectedDevice = device;
    return true;
}

export async function captureAdbScreenshot(): Promise<File> {
    const adb = await getAdbConnection();
    const socket = await adb.subprocess.shellProtocol!.spawn('screencap -p');
    const reader = socket.stdout.getReader();

    const chunks: Uint8Array[] = [];
    try {
        while (true) {
            const {done, value} = await reader.read();
            if (done) {
                break;
            }
            chunks.push(value);
        }
    } finally {
        reader.releaseLock();
    }
    const blob = new Blob(chunks as BlobPart[], {type: 'image/png'});
    const fileName = `screenshot_${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
    return new File([blob], fileName, {type: 'image/png'});
}
