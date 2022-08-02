export class RegenbogenICEError {
    constructor (public message: string, public status_code: number, public additional_fields?: { [key: string]: any }) {}
    buildJSON() {
        return {
            error: this.message,
            ...this.additional_fields
        }
    }
}