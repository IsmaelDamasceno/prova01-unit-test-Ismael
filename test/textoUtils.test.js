const TextoUtils = require("../src/textoUtils");

describe("Texto Utils", () => {
    test("Testar inversão", async () => {
        const t = new TextoUtils();
        expect(t.inverter("Boga@123")).toStrictEqual("321@agoB");
    });

    test("Testar palíndromos", async () => {
        const t = new TextoUtils();
        expect(t.ehPalindromo("arara")).toStrictEqual(true);
        expect(t.ehPalindromo("ararA")).toStrictEqual(true);
        expect(t.ehPalindromo("2arara4")).toStrictEqual(false);
        expect(t.ehPalindromo("araras")).toStrictEqual(false);
    });

    test("Testar capitalização", async () => {
        const t = new TextoUtils();
        expect(t.capitalizar("Boga")).toStrictEqual("Boga");
        expect(t.capitalizar("boga")).toStrictEqual("Boga");
        expect(t.capitalizar("boGa")).toStrictEqual("Boga");
    });

    test("Testar ocorrências", async () => {
        const t = new TextoUtils();
        expect(t.contarOcorrencias("bogaboga", 'boga')).toStrictEqual(2);
        expect(t.contarOcorrencias("boga", 'boga')).toStrictEqual(1);
        expect(t.contarOcorrencias("boga boga", 'boga')).toStrictEqual(2);
        expect(t.contarOcorrencias("ab😂c", '😂')).toStrictEqual(1);
        expect(t.contarOcorrencias("ab😂😂c", '😂')).toStrictEqual(2);
        expect(t.contarOcorrencias("ab😂😂c", 'ab')).toStrictEqual(1);
        expect(t.contarOcorrencias("ab😂😂c", '😂😂c')).toStrictEqual(1);
        expect(t.contarOcorrencias("ab😂c😂", '😂😂c')).toStrictEqual(0);
        expect(t.contarOcorrencias("ab😂c😂", '')).toStrictEqual(0);
        expect(t.contarOcorrencias("  ", ' ')).toStrictEqual(2);
        expect(t.contarOcorrencias("", '')).toStrictEqual(0);
        expect(t.contarOcorrencias("123", 1)).toStrictEqual(1);
    });

    test("Testar remoção de espaços", async () => {
        const t = new TextoUtils();
        expect(t.removerEspacosExtras("abc ")).toStrictEqual("abc");
        expect(t.removerEspacosExtras("😂  abc ")).toStrictEqual("😂 abc");
        expect(t.removerEspacosExtras("  😂abc ")).toStrictEqual("😂abc");
    });

    test("Testar slug", async () => {
        const t = new TextoUtils();
        expect(t.paraSlug("abc world")).toStrictEqual("abc-world");
        expect(t.paraSlug("-abc-world")).toStrictEqual("-abc-world");
        expect(t.paraSlug("-abc😂 world")).toStrictEqual("-abc-world");
        expect(t.paraSlug("-abc-😂 😂world")).toStrictEqual("-abc--world");
        expect(t.paraSlug("-abc-😂-😂 world")).toStrictEqual("-abc---world");
    });

    test("Testar truncamento", async () => {
        const t = new TextoUtils();
        expect(t.truncar("abc", 3)).toStrictEqual("abc");
        expect(t.truncar("abc", 10)).toStrictEqual("abc");
        expect(t.truncar("abc", 2)).toStrictEqual("ab...");
        expect(t.truncar("abc", 0)).toStrictEqual("...");
        expect(t.truncar("", 3)).toStrictEqual("");
        expect(t.truncar("", 0)).toStrictEqual("");
        expect(t.truncar("", 0.5)).toStrictEqual("");
        expect(t.truncar("a", 0.5)).toStrictEqual("...");
        expect(t.truncar("😂", 1)).toStrictEqual("😂");
    });
});