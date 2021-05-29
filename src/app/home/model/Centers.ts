import { Sessions } from "./Sessions";

export class Center {
    center_id:number;
    name:string;
    address:string;
    state_name:string;
    district_name:string;
    block_name:string;
    pincode:number;
    from:string;
    to:string;
    fee_type:string;
    sessions : Array<Sessions>;

    constructor(){
    }
}
