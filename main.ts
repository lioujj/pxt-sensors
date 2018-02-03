//% weight=0 color=#3CB371 icon="\uf0ad" block="sensors"
namespace sensors {
    let dht11_pin = DigitalPin.P0;

    function signal_dht11(dht11_pin: DigitalPin): void {
        pins.digitalWritePin(dht11_pin, 0)
        basic.pause(18)
        let i = pins.digitalReadPin(pin)
        pins.setPull(dht11_pin, PinPullMode.PullUp);

    }

    function dht11_read(): number {
        signal_dht11(dht11_pin);

        // Wait for response header to finish
        while (pins.digitalReadPin(dht11_pin) == 1);
        while (pins.digitalReadPin(dht11_pin) == 0);
        while (pins.digitalReadPin(dht11_pin) == 1);

        let value = 0;
        let counter = 0;

        for (let i = 0; i <= 32 - 1; i++) {
            while (pins.digitalReadPin(dht11_pin) == 0);
            counter = 0
            while (pins.digitalReadPin(dht11_pin) == 1) {
                counter += 1;
            }
            if (counter > 4) {
                value = value + (1 << (31 - i));
            }
        }
        return value;
    }

    export enum Dht11Result {
        //% block="temperature"
        temperature,
        //% block="humidity"
        humidity
    }


    //% blockId=dht11_set_pin block="DHT11 set pin %pinarg|type %dhtResult"
    export function set_DHT_pin(pin_arg: DigitalPin, dht_result: Dht11Result): number {
        dht11_pin = pin_arg;

        switch (dhtResult) {
            case Dht11Result.temperature: return (dht11_read() & 0x0000ff00) >> 8;
            case Dht11Result.humidity: return dht11_read() >> 24;
        }
    }


    export enum PingUnit {
        //% block="cm"
        Centimeters,
        //% block="inches"
        Inches,
        //% block="μs"
        MicroSeconds
    }

    //% blockId=sonar_ping block="ultrasonic trig %trig|echo %echo|unit %unit"
    export function ping(trig: DigitalPin, echo: DigitalPin, unit: PingUnit, maxCmDistance = 500): number {
        // send pulse
        pins.setPull(trig, PinPullMode.PullNone);
        pins.digitalWritePin(trig, 0);
        control.waitMicros(2);
        pins.digitalWritePin(trig, 1);
        control.waitMicros(10);
        pins.digitalWritePin(trig, 0);

        // read pulse
        const d = pins.pulseIn(echo, PulseValue.High, maxCmDistance * 58);

        switch (unit) {
            case PingUnit.Centimeters: return d / 58;
            case PingUnit.Inches: return d / 148;
            default: return d ;
        }
    }
}
