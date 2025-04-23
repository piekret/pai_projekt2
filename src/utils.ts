import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { Staff } from "./staff/dto/staff.dto";
import type { Inmate } from "./inmates/dto/inmate.dto";

type Data = {
    staff: Staff[]
    inmates: Inmate[];
} // !!! PAMIETAC ZEBY ZMIENIC POZNIEJ !!!!!

const dataPath = path.join(__dirname, "data.json");

export const writeData = async (data: Data) => {
    await writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8')
}

export const readData = async () => {
    try {
        const content = await readFile(dataPath, 'utf-8');
        return JSON.parse(content);
    } catch (e) {
        const temp = {
            staff: [],
            inmates: [] 
        };
        await writeData(temp);
        return temp;
    }
}