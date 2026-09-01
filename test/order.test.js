
const Order = require("../src/order");

function createProduct(id = 1, price) {
    return { id, price };
}

function getOrder() {
    return new Order({ name: "Test", id: 1 });
}

describe("order", () => {

    test("deve criar instância com default parameters", () => {
        const order = getOrder();
        expect(order.customer).toEqual({ name: "Test", id: 1 });
        expect(order.items).toEqual([]);
        expect(order.coupon).toBeNull();
        expect(order.shipping).toBe(0);
        expect(order.status).toBe('pending');
        expect(order.payment).toBeNull();
    });

    describe('addItem', () => {
        test("deve dar erro se adicionar 0 ou menos itens", () => {
            const order = getOrder();
            expect(() => order.addItem(
                createProduct(),
                0
            )).toThrow('Quantity must be greater than zero');
            expect(() => order.addItem(
                createProduct(),
                -1
            )).toThrow('Quantity must be greater than zero');
        });

        test("deve adicionar o item na lista vazia", () => {
            let order = getOrder();
            order.addItem(createProduct());
            expect(order.items).toHaveLength(1);
            expect(order.items[0]).toEqual({ product: createProduct(), quantity: 1 });
        });

        test("deve somar a quantidade do item existente", () => {
            let order = getOrder();

            order.addItem(createProduct());
            order.addItem(createProduct());
            expect(order.items).toHaveLength(1);
            expect(order.items[0]).toEqual({ product: createProduct(), quantity: 2 });
        });

        test("deve adicionar novos items distintivamente", () => {
            let order = getOrder();

            order.addItem(createProduct(1));
            order.addItem(createProduct(2));
            order.addItem(createProduct(2));
            expect(order.items).toHaveLength(2);
            expect(order.items[0]).toEqual({ product: createProduct(1), quantity: 1 });
            expect(order.items[1]).toEqual({ product: createProduct(2), quantity: 2 });
        });
    });

    describe('removeItem', () => {

        test("deve manter lista vazia sem falhar", () => {
            let order = getOrder();

            order.removeItem(1);
            expect(order.items).toHaveLength(0);
        });

        test("deve permanecer igual ao não incontrar item", () => {
            let order = getOrder();
            order.addItem(createProduct(2));
            order.removeItem(1);
            expect(order.items).toHaveLength(1);
            expect(order.items[0]).toEqual({ product: createProduct(2), quantity: 1 });
        });

        test("deve remover item corretamente", () => {
            let order = getOrder();
            order.addItem(createProduct(1));
            order.removeItem(1);
            expect(order.items).toHaveLength(0);
        });
    });

    describe('updateQuantity', () => {
        test("deve atualizar a quantidade de um item existente", () => {
            const order = getOrder();
            const product = createProduct(1, 10);

            order.addItem(product, 2);
            order.updateQuantity(1, 5);

            expect(order.items[0]).toEqual({
                product,
                quantity: 5
            });
        });

        test("deve remover o item quando quantidade for 0", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 10), 2);
            order.updateQuantity(1, 0);

            expect(order.items).toHaveLength(0);
        });

        test("deve remover o item quando quantidade for negativa", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 10), 2);
            order.updateQuantity(1, -1);

            expect(order.items).toHaveLength(0);
        });

        test("deve dar erro quando o produto não existe", () => {
            const order = getOrder();

            expect(() => order.updateQuantity(1, 5))
                .toThrow("Product not found");
        });

        test("deve retornar a própria ordem", () => {
            const order = getOrder();

            expect(order.updateQuantity(1, 0)).toBe(order);
        });
    });

    describe('getItemCount', () => {
        test("deve retornar 0 para uma ordem vazia", () => {
            const order = getOrder();

            expect(order.getItemCount()).toBe(0);
        });

        test("deve retornar a quantidade total dos itens", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 10), 2);
            order.addItem(createProduct(2, 20), 3);

            expect(order.getItemCount()).toBe(5);
        });

        test("deve somar corretamente itens repetidos", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 10), 2);
            order.addItem(createProduct(1, 10), 3);

            expect(order.getItemCount()).toBe(5);
        });
    });

    describe('getSubtotal', () => {
        test("deve retornar 0 para uma ordem vazia", () => {
            const order = getOrder();

            expect(order.getSubtotal()).toBe(0);
        });

        test("deve calcular o subtotal de um item", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 10), 3);

            expect(order.getSubtotal()).toBe(30);
        });

        test("deve calcular o subtotal de vários itens", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 10), 2);
            order.addItem(createProduct(2, 20), 3);

            expect(order.getSubtotal()).toBe(80);
        });
    });

    describe('applyCoupon', () => {
        test("deve dar erro para coupon nulo", () => {
            const order = getOrder();

            expect(() => order.applyCoupon(null))
                .toThrow("Invalid coupon");
        });

        test("deve dar erro para coupon sem código", () => {
            const order = getOrder();

            expect(() => order.applyCoupon({ value: 10 }))
                .toThrow("Invalid coupon");
        });

        test("deve aplicar um coupon válido", () => {
            const order = getOrder();
            const coupon = {
                code: "SAVE10",
                type: "percentage",
                value: 10
            };

            const result = order.applyCoupon(coupon);

            expect(order.coupon).toBe(coupon);
            expect(result).toBe(order);
        });

        test("deve dar erro para coupon expirado", () => {
            const order = getOrder();

            const coupon = {
                code: "OLD",
                type: "percentage",
                value: 10,
                expiresAt: new Date("2020-01-01")
            };

            expect(() => order.applyCoupon(coupon))
                .toThrow("Coupon expired");
        });

        test("deve aceitar coupon que ainda não expirou", () => {
            const order = getOrder();

            const coupon = {
                code: "VALID",
                type: "percentage",
                value: 10,
                expiresAt: new Date("2099-01-01")
            };

            expect(() => order.applyCoupon(coupon)).not.toThrow();
            expect(order.coupon).toBe(coupon);
        });
    });

    describe('removeCoupon', () => {
        test("deve remover o coupon", () => {
            const order = getOrder();

            order.applyCoupon({
                code: "SAVE10",
                type: "percentage",
                value: 10
            });

            const result = order.removeCoupon();

            expect(order.coupon).toBeNull();
            expect(result).toBe(order);
        });

        test("deve permanecer nulo quando não existe coupon", () => {
            const order = getOrder();

            order.removeCoupon();

            expect(order.coupon).toBeNull();
        });
    });

    describe('getDiscount', () => {
        test("deve retornar 0 sem coupon", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 100), 2);

            expect(order.getDiscount()).toBe(0);
        });

        test("deve calcular desconto percentual", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 100), 2);

            order.applyCoupon({
                code: "SAVE10",
                type: "percentage",
                value: 10
            });

            expect(order.getDiscount()).toBe(20);
        });

        test("deve calcular desconto fixo", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 100), 2);

            order.applyCoupon({
                code: "SAVE30",
                type: "fixed",
                value: 30
            });

            expect(order.getDiscount()).toBe(30);
        });

        test("deve limitar desconto fixo ao subtotal", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 20), 1);

            order.applyCoupon({
                code: "SAVE50",
                type: "fixed",
                value: 50
            });

            expect(order.getDiscount()).toBe(20);
        });

        test("deve dar erro para tipo de coupon desconhecido", () => {
            const order = getOrder();

            order.applyCoupon({
                code: "UNKNOWN",
                type: "something-else",
                value: 10
            });

            expect(() => order.getDiscount())
                .toThrow("Unknown coupon type");
        });
    });

    describe('setShipping', () => {
        test("deve definir o valor do frete", () => {
            const order = getOrder();

            const result = order.setShipping(15);

            expect(order.shipping).toBe(15);
            expect(result).toBe(order);
        });

        test("deve aceitar frete zero", () => {
            const order = getOrder();

            expect(() => order.setShipping(0)).not.toThrow();
            expect(order.shipping).toBe(0);
        });

        test("deve dar erro para frete negativo", () => {
            const order = getOrder();

            expect(() => order.setShipping(-1))
                .toThrow("Shipping cannot be negative");
        });
    });

    describe('getTax', () => {
        test("deve calcular imposto sobre o subtotal", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 100), 2);

            expect(order.getTax()).toBe(20);
        });

        test("deve usar a taxa fornecida", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 100), 2);

            expect(order.getTax(0.2)).toBe(40);
        });

        test("deve calcular imposto depois do desconto", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 100), 2);

            order.applyCoupon({
                code: "SAVE10",
                type: "percentage",
                value: 10
            });

            expect(order.getTax()).toBe(18);
        });
    });

    describe('getTotal', () => {
        test("deve calcular total sem desconto ou frete", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 100), 2);

            expect(order.getTotal()).toBe(220);
        });

        test("deve incluir desconto no total", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 100), 2);

            order.applyCoupon({
                code: "SAVE10",
                type: "percentage",
                value: 10
            });

            // subtotal = 200
            // discount = 20
            // tax = 18
            // total = 198
            expect(order.getTotal()).toBe(198);
        });

        test("deve incluir frete no total", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 100), 2);
            order.setShipping(15);

            expect(order.getTotal()).toBe(235);
        });

        test("deve usar a taxa de imposto fornecida", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 100), 2);

            expect(order.getTotal(0.2)).toBe(240);
        });
    });

    describe('isEmpty', () => {
        test("deve retornar true quando não existem itens", () => {
            const order = getOrder();

            expect(order.isEmpty()).toBe(true);
        });

        test("deve retornar false quando existem itens", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 10));

            expect(order.isEmpty()).toBe(false);
        });

        test("deve retornar true depois de remover todos os itens", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 10));
            order.removeItem(1);

            expect(order.isEmpty()).toBe(true);
        });
    });

    describe('hasProduct', () => {
        test("deve retornar true quando o produto existe", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 10));

            expect(order.hasProduct(1)).toBe(true);
        });

        test("deve retornar false quando o produto não existe", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 10));

            expect(order.hasProduct(2)).toBe(false);
        });

        test("deve retornar false para uma ordem vazia", () => {
            const order = getOrder();

            expect(order.hasProduct(1)).toBe(false);
        });
    });

    describe('getProduct', () => {
        test("deve retornar o produto quando ele existe", () => {
            const order = getOrder();
            const product = createProduct(1, 10);

            order.addItem(product);

            expect(order.getProduct(1)).toBe(product);
        });

        test("deve retornar null quando o produto não existe", () => {
            const order = getOrder();

            expect(order.getProduct(1)).toBeNull();
        });
    });

    describe('canCheckout', () => {
        test("deve retornar false para ordem vazia", () => {
            const order = getOrder();

            expect(order.canCheckout()).toBe(false);
        });

        test("deve retornar true para ordem pendente com total maior que zero", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 100));

            expect(order.canCheckout()).toBe(true);
        });

        test("deve retornar false para ordem cancelada", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 100));
            order.cancel();

            expect(order.canCheckout()).toBe(false);
        });

        test("deve retornar false para ordem paga", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 100));
            order.checkout({ method: "credit-card" });

            expect(order.canCheckout()).toBe(false);
        });

        test("deve retornar false quando total for zero", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 0));

            expect(order.canCheckout()).toBe(false);
        });
    });

    describe('checkout', () => {
        test("deve dar erro quando a ordem não pode ser finalizada", () => {
            const order = getOrder();

            expect(() => order.checkout({ method: "credit-card" }))
                .toThrow("Order cannot be checked out");
        });

        test("deve dar erro quando pagamento não é fornecido", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 100));

            expect(() => order.checkout())
                .toThrow("Payment is required");
        });

        test("deve dar erro quando pagamento não possui método", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 100));

            expect(() => order.checkout({}))
                .toThrow("Payment is required");
        });

        test("deve marcar a ordem como paga", () => {
            const order = getOrder();
            const payment = {
                method: "credit-card"
            };

            order.addItem(createProduct(1, 100));

            const result = order.checkout(payment);

            expect(order.payment).toBe(payment);
            expect(order.status).toBe("paid");
            expect(result).toBe(order);
        });
    });

    describe('cancel', () => {
        test("deve cancelar uma ordem pendente", () => {
            const order = getOrder();

            const result = order.cancel();

            expect(order.status).toBe("cancelled");
            expect(result).toBe(order);
        });

        test("deve dar erro ao cancelar uma ordem paga", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 100));
            order.checkout({ method: "credit-card" });

            expect(() => order.cancel())
                .toThrow("Paid order cannot be cancelled");
        });

        test("deve permitir cancelar uma ordem já cancelada", () => {
            const order = getOrder();

            order.cancel();

            expect(() => order.cancel()).not.toThrow();
            expect(order.status).toBe("cancelled");
        });
    });

    describe('isPaid', () => {
        test("deve retornar false para uma ordem pendente", () => {
            const order = getOrder();

            expect(order.isPaid()).toBe(false);
        });

        test("deve retornar true para uma ordem paga", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 100));
            order.checkout({ method: "credit-card" });

            expect(order.isPaid()).toBe(true);
        });
    });

    describe('isCancelled', () => {
        test("deve retornar false para uma ordem pendente", () => {
            const order = getOrder();

            expect(order.isCancelled()).toBe(false);
        });

        test("deve retornar true para uma ordem cancelada", () => {
            const order = getOrder();

            order.cancel();

            expect(order.isCancelled()).toBe(true);
        });

        test("deve retornar false para uma ordem paga", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 100));
            order.checkout({ method: "credit-card" });

            expect(order.isCancelled()).toBe(false);
        });
    });

    describe('getSummary', () => {
        test("deve retornar o resumo completo da ordem", () => {
            const order = getOrder();

            order.addItem(createProduct(1, 100), 2);

            order.applyCoupon({
                code: "SAVE10",
                type: "percentage",
                value: 10
            });

            order.setShipping(15);

            expect(order.getSummary()).toEqual({
                customer: { name: "Test", id: 1 },
                items: 2,
                subtotal: 200,
                discount: 20,
                shipping: 15,
                tax: 18,
                total: 213,
                status: "pending"
            });
        });

        test("deve retornar resumo correto de uma ordem vazia", () => {
            const order = getOrder();

            expect(order.getSummary()).toEqual({
                customer: { name: "Test", id: 1 },
                items: 0,
                subtotal: 0,
                discount: 0,
                shipping: 0,
                tax: 0,
                total: 0,
                status: "pending"
            });
        });
    });
});
