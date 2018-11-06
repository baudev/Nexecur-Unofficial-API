# Nexecur Unofficial API

![GitHub release](https://img.shields.io/github/release/baudev/Nexecur-Unofficial-API.svg)
![GitHub repo size in bytes](https://img.shields.io/github/repo-size/baudev/Nexecur-Unofficial-API.svg)
![GitHub](https://img.shields.io/github/license/baudev/Nexecur-Unofficial-API.svg)

This is an Unofficial API of the Nexecur system. 

## Installation

1. `git clone https://github.com/baudev/Nexecur-Unofficial-API.git`
2. `npm install`
3. Configure the `config.json` file. You should provide the following values:
- `id_site` (also called wiring code)
- `password` (also called PIN)

The value `deviceName` is optional. This is the name that will appear in the history when you enable or disable the alarm from this API.

## Examples

- Return the current alarm state:
```typescript
import {NexecurAPI} from "./Controllers/NexecurAPI";
import {AlarmStatus} from "./Models/AlarmStatus";

NexecurAPI.getAlarmStatus().then((response: AlarmStatus) => {
    // success...
}).catch((error)=>{
    // error...
});
```

- Return the alarm historic:
```typescript
import {NexecurAPI} from "./Controllers/NexecurAPI";

NexecurAPI.getHistoric().then((response: any) => {
    // success...
}).catch((error)=>{
    // error...
});
```

- Enable the alarm:
```typescript
import {NexecurAPI} from "./Controllers/NexecurAPI";
NexecurAPI.enableAlarm().then(() => {
    // success...
}).catch((error)=>{
    // error...
});
```

## License

MIT License

Copyright (c) 2018 Baudev, Quelqundev.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

### Legal
This code is in no way affiliated with, authorized, maintained, sponsored or endorsed by Nexecur or any of its affiliates or subsidiaries. This is an independent and unofficial API. Use at your own risk.
