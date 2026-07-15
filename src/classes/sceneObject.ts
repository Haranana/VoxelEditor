export abstract class SceneObject {
    
    sceneId: number | null = null;
    name: string;

    constructor(name = "object") {
        this.name = name;
    }
}