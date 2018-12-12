//% weight=0 color=#3CB371 icon="\uf2db" block="sensors"
namespace sensors {

    function signal_dht11(pin: DigitalPin): void {
        pins.digitalWritePin(pin, 0);
        basic.pause(18);
        let i = pins.digitalReadPin(pin);
        pins.setPull(pin, PinPullMode.PullUp);
    }

    function dht11_read(pin: DigitalPin): number {
        signal_dht11(pin);

        // Wait for response header to finish
        while (pins.digitalReadPin(pin) == 1);
        while (pins.digitalReadPin(pin) == 0);
        while (pins.digitalReadPin(pin) == 1);

        let value = 0;
        let counter = 0;

        for (let i = 0; i <= 32 - 1; i++) {
            while (pins.digitalReadPin(pin) == 0);
            counter = 0
            while (pins.digitalReadPin(pin) == 1) {
                counter += 1;
            }
            if (counter > 4) {
                value = value + (1 << (31 - i));
            }
        }
        return value;
    }

    export enum Dht11Result {
        //% block="Celsius"
        Celsius,
        //% block="Fahrenheit"
        Fahrenheit,
        //% block="humidity"
        humidity
    }

    //% blockId=get_DHT11_value block="DHT11 set pin %pin_arg|get %dhtResult" blockExternalInputs=true
    //% pin_arg.fieldEditor="gridpicker" pin_arg.fieldOptions.columns=4
    //% pin_arg.fieldOptions.tooltips="false" pin_arg.fieldOptions.width="300"
    export function get_DHT11_value(pin_arg: DigitalPin, dhtResult: Dht11Result): number {
        switch (dhtResult) {
            case Dht11Result.Celsius: return (dht11_read(pin_arg) & 0x0000ff00) >> 8;
            case Dht11Result.Fahrenheit: return ((dht11_read(pin_arg) & 0x0000ff00) >> 8) * 9 / 5 + 32;
            case Dht11Result.humidity: return dht11_read(pin_arg) >> 24;
            default: return 0;
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

    export enum LEDType {
        //% block="cathode"
        cathode,
        //% block="anode"
        anode
    }

    //% blockId=sensor_ping block="ultrasonic trig %trig|echo %echo|get distance %unit"
    //% trig.fieldEditor="gridpicker" trig.fieldOptions.columns=4
    //% trig.fieldOptions.tooltips="false" trig.fieldOptions.width="300"
    //% echo.fieldEditor="gridpicker" echo.fieldOptions.columns=4
    //% echo.fieldOptions.tooltips="false" echo.fieldOptions.width="300"
    export function sensor_ping(trig: DigitalPin, echo: DigitalPin, unit: PingUnit, maxCmDistance = 500): number {
        // send pulse
        pins.setPull(trig, PinPullMode.PullNone);
        pins.digitalWritePin(trig, 0);
        control.waitMicros(2);
        pins.digitalWritePin(trig, 1);
        control.waitMicros(10);
        pins.digitalWritePin(trig, 0);

        // read pulse
        const d = pins.pulseIn(echo, PulseValue.High, maxCmDistance * 43);

        switch (unit) {
            case PingUnit.Centimeters: return d / 43;
            case PingUnit.Inches: return d / 110;
            default: return d;
        }
    }
    //% blockId=RGBLight block="set RGB type:common %myType|red pin %RedPin|green pin %GreenPin|blue pin %BluePin|value of red(0~255) %RedValue|value of green(0~255) %GreenValue|value of blue(0~255) %BlueValue" blockExternalInputs=false
    //% RedValue.min=0 RedValue.max=255 GreenValue.min=0 GreenValue.max=255 BlueValue.min=0 BlueValue.max=255
    //% RedPin.fieldEditor="gridpicker" RedPin.fieldOptions.columns=4
    //% RedPin.fieldOptions.tooltips="false" RedPin.fieldOptions.width="300"
    //% GreenPin.fieldEditor="gridpicker" GreenPin.fieldOptions.columns=4
    //% GreenPin.fieldOptions.tooltips="false" GreenPin.fieldOptions.width="300"
    //% BluePin.fieldEditor="gridpicker" BluePin.fieldOptions.columns=4
    //% BluePin.fieldOptions.tooltips="false" BluePin.fieldOptions.width="300"
    export function RGBLight(myType: LEDType, RedPin: AnalogPin, GreenPin: AnalogPin, BluePin: AnalogPin, RedValue: number, GreenValue: number, BlueValue: number): void {
        pins.analogWritePin(RedPin, pins.map((myType == LEDType.cathode ? RedValue : (255 - RedValue)), 0, 255, 0, 1023));
        pins.analogWritePin(GreenPin, pins.map((myType == LEDType.cathode ? GreenValue : (255 - GreenValue)), 0, 255, 0, 1023));
        pins.analogWritePin(BluePin, pins.map((myType == LEDType.cathode ? BlueValue : (255 - BlueValue)), 0, 255, 0, 1023));
    }
}
