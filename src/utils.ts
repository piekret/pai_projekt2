import { readFile, writeFile } from "fs/promises";
import path from "path";

type Data = any; // !!! PAMIETAC ZEBY ZMIENIC POZNIEJ !!!!!

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
            staff: []   // !! JAK BEDZIECIE COS PISAC WLASNEGO TO DODAJCIE TUTAJ np: inmates[] czy cos !!
        };
        await writeData(temp);
        return temp;
    }
}