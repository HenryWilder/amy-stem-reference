export type Kind = 'function' | 'type' | 'field' | 'trait';

export interface ItemLink {
    text: string;
    rel: string[];
}

export type DescriptionLine = (string | ItemLink | { tex: string })[];

export interface GlossaryItem {
    /** Affects reference highlighting */
    kind: Kind;

    /** First item will be used as displayname */
    aliases: string[];

    /** Each element represents a separate paragraph. The first paragraph will be shown on the tooltip */
    description: DescriptionLine[];

    /** Should be valid KaTeX */
    notation?: string;

    /** Only and always for `kind == field` */
    fieldData?: {
        /** Field type */
        ty: ItemPath;

        /** Field symbol in notation */
        notationRef: string;
    };

    /** Children of the item */
    properties?: { [key: string]: GlossaryItem };
}

export interface GlossaryModule {
    [item: string]: GlossaryItem;
}

export type Glossary = { [module: string]: GlossaryModule };

import { glossary } from './glossary-data';
export { glossary } from './glossary-data';

export type ItemPath = [string, ...string[], string];

export const itemPathToHref = (path: ItemPath): string => '/' + path.join('/');

export const getGlossaryItem = (path: ItemPath): GlossaryItem => {
    // console.log(path.join('/'));

    const moduleName = path[0];
    const module: GlossaryModule | undefined = glossary[moduleName];
    if (module === undefined) {
        throw new Error(`'${moduleName}' is not a valid module name.`);
    }

    const rootName = path[1];
    const root: GlossaryItem | undefined = module[rootName];
    if (root === undefined) {
        throw new Error(`'${rootName}' is not a valid item in the module ${moduleName}.`);
    }
    let current: GlossaryItem = root;

    path.slice(2).forEach((part, index) => {
        index += 2; // Account for slice
        const subPath = path.slice(0, index).join('/');
        if (current.properties !== undefined) {
            const property = current.properties[part];
            if (property !== undefined) {
                current = property;
            } else {
                throw new Error(`'${part}' is not a property of "${subPath}". The valid properties are: [${Object.keys(current.properties).join(', ')}]`);
            }
        } else {
            throw new Error(`'${subPath}' has no properties (looking for '${part}')`);
        }
    });

    return current;
};
