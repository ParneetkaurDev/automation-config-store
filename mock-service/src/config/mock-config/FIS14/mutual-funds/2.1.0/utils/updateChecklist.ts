type ChecklistUpdateMap = Record<string, string>;

interface Descriptor {
    name?: string;
    code?: string;
}

interface ChecklistEntry {
    descriptor?: Descriptor;
    value?: string;
}

interface Tag {
    descriptor?: Descriptor;
    list?: ChecklistEntry[];
}

interface Item {
    tags?: Tag[];
}

interface Order {
    items?: Item[];
}

export function updateChecklist(
    order: Order,
    updates: ChecklistUpdateMap
): Order {
    if (!order?.items) return order;

    order.items.forEach((item) => {
        const checklistTag = item.tags?.find(
            (tag) => tag.descriptor?.code === "CHECKLISTS"
        );

        if (checklistTag?.list) {
            checklistTag.list.forEach((entry) => {
                const code = entry.descriptor?.code;

                if (code && updates[code]) {
                    entry.value = updates[code];
                }
            });
        }
    });

    return order;
}