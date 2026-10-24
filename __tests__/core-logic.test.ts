import {
  SubmissionGate,
  validarAcceso,
  validarCorreo,
  validarNuevaContrasena,
  validarRegistro,
} from "@/modules/auth/viewmodels/auth-validation";

import {
  filterProductos,
  opcionesFiltroProductos,
  sortProductos,
} from "@/modules/productos/viewmodels/product-filters";

import {
  calendarDate,
  decimal,
  finiteNumber,
  identifier,
  list,
  nullableNumber,
  nullableText,
  numericDecimal,
  record,
  text,
} from "@/shared/adapters/validation";

import { formatCalendarDate } from "@/utils/format-calendar-date";
import { formatPrice } from "@/utils/format-price";

const campos = {
  nombre: "Benilde",
  correo: "usuario@correo.com",
  telefono: "3312345678",
  password: "12345678",
  confirmacionPassword: "12345678",
};

describe("Validaciones de autenticación", () => {
  test("acepta un correo válido", () => {
    expect(validarCorreo("usuario@correo.com")).toEqual({});
  });

  test("rechaza un correo inválido", () => {
    expect(validarCorreo("correo-invalido")).toHaveProperty("correo");
  });

  test("solicita contraseña para iniciar sesión", () => {
    expect(
      validarAcceso({
        ...campos,
        password: "",
      }),
    ).toHaveProperty("password");
  });

  test("valida longitud y confirmación de contraseña", () => {
    const resultado = validarNuevaContrasena({
      ...campos,
      password: "123",
      confirmacionPassword: "456",
    });

    expect(resultado).toHaveProperty("password");
    expect(resultado).toHaveProperty("confirmacionPassword");
  });

  test("valida los datos obligatorios del registro", () => {
    const resultado = validarRegistro({
      ...campos,
      nombre: "",
      telefono: "",
    });

    expect(resultado).toHaveProperty("nombre");
    expect(resultado).toHaveProperty("telefono");
  });
});

describe("Validación de datos externos", () => {
  test("acepta objetos y listas válidas", () => {
    expect(record({ id: 1 }, "dato")).toEqual({ id: 1 });
    expect(list([1, 2], "datos")).toEqual([1, 2]);
  });

  test("rechaza un valor que no es objeto", () => {
    expect(() => record(null, "dato")).toThrow();
  });

  test("valida texto y números finitos", () => {
    expect(text("Brenns", "nombre")).toBe("Brenns");
    expect(finiteNumber(10, "precio")).toBe(10);

    expect(() => text(10, "nombre")).toThrow();
    expect(() => finiteNumber(Infinity, "precio")).toThrow();
  });

  test("normaliza identificadores válidos", () => {
    expect(identifier(15, "id")).toBe("15");

    expect(() => identifier(0, "id")).toThrow();
    expect(() => identifier(1.5, "id")).toThrow();
  });

  test("conserva importes decimales", () => {
    expect(decimal("1200.50", "precio")).toBe("1200.50");
    expect(decimal(125.5, "precio")).toBe("125.5");

    expect(() => decimal("abc", "precio")).toThrow();
  });

  test("valida fechas de calendario", () => {
    expect(calendarDate("2026-10-15", "fecha")).toBe("2026-10-15");
    expect(calendarDate("2024-02-29", "fecha")).toBe("2024-02-29");
    expect(calendarDate(null, "fecha")).toBeNull();

    expect(() => calendarDate("2026-02-30", "fecha")).toThrow();
  });

  test("acepta valores anulables", () => {
    expect(nullableText(null, "descripcion")).toBeNull();
    expect(nullableText("texto", "descripcion")).toBe("texto");

    expect(nullableNumber(null, "precio")).toBeNull();
    expect(nullableNumber(25, "precio")).toBe(25);
  });

  test("rechaza decimales inválidos", () => {
    expect(() => decimal({}, "precio")).toThrow();
    expect(() => decimal(Number.POSITIVE_INFINITY, "precio")).toThrow();
  });

  test("convierte números científicos y conserva decimales normales", () => {
    expect(numericDecimal(1e-7, "monto")).toBe("0.0000001");
    expect(numericDecimal(125.5, "monto")).toBe("125.5");
  });

  test("rechaza números fuera del rango seguro", () => {
    expect(() => numericDecimal(1e21, "monto")).toThrow();
  });

  test("rechaza fechas inválidas", () => {
    expect(() => calendarDate("texto", "fecha")).toThrow();
    expect(() => calendarDate("2025-02-29", "fecha")).toThrow();

    expect(calendarDate("2024-02-29T00:00:00.000Z", "fecha")).toBe(
      "2024-02-29",
    );
  });
});

describe("Formato de información", () => {
  test("formatea precios", () => {
    expect(formatPrice(null)).toBe("Precio no disponible");
    expect(formatPrice(1200)).toBe("$1,200");
    expect(formatPrice("1200.50")).toBe("$1,200.5");
  });

  test("rechaza importes de texto inválidos", () => {
    expect(() => formatPrice("abc")).toThrow();
  });

  test("formatea fechas sin cambiar el día", () => {
    expect(formatCalendarDate("2026-10-15")).toBe("15 octubre 2026");
  });
});

describe("Filtros de productos", () => {
  const productos = [
    {
      id: "1",
      nombre: "Ácido capilar",
      descripcion: "Tratamiento profesional",
      precio: "150.00",
      marca: "Brenns",
      categoria: "Cabello",
      imagen: null,
      variantes: [],
      enStock: true,
    },
    {
      id: "2",
      nombre: "Crema facial",
      descripcion: "Cuidado facial",
      precio: "100.00",
      marca: "Brenns",
      categoria: "Rostro",
      imagen: null,
      variantes: [],
      enStock: false,
    },
  ];

  test("busca productos ignorando acentos", () => {
    expect(filterProductos(productos, "acido", "Todos")).toHaveLength(1);
  });

  test("filtra productos con existencias", () => {
    expect(filterProductos(productos, "", "Con existencias")).toHaveLength(1);
  });

  test("filtra por categoría", () => {
    expect(filterProductos(productos, "", "Categoría: Rostro")).toHaveLength(1);
  });

  test("ordena productos por precio", () => {
    const resultado = sortProductos(productos, "Precio menor");

    expect(resultado[0].id).toBe("2");
    expect(resultado[1].id).toBe("1");
  });

  test("genera opciones de filtros", () => {
    expect(opcionesFiltroProductos(productos)).toContain("Categoría: Cabello");
    expect(opcionesFiltroProductos(productos)).toContain("Con existencias");
  });

  test("mantiene el orden de publicación", () => {
    const resultado = sortProductos(productos, "Publicación");

    expect(resultado).toBe(productos);
  });

  test("ordena productos por nombre", () => {
    const resultado = sortProductos(productos, "Nombre A–Z");

    expect(resultado[0].nombre).toBe("Ácido capilar");
    expect(resultado[1].nombre).toBe("Crema facial");
  });

  test("ordena productos de mayor a menor precio", () => {
    const resultado = sortProductos(productos, "Precio mayor");

    expect(resultado[0].id).toBe("1");
    expect(resultado[1].id).toBe("2");
  });

  test("coloca productos sin precio después de los que tienen precio", () => {
    const sinPrecio = {
      ...productos[0],
      id: "3",
      nombre: "Producto sin precio",
      precio: null,
    };

    const resultado = sortProductos([sinPrecio, productos[1]], "Precio menor");

    expect(resultado[0].id).toBe("2");
    expect(resultado[1].id).toBe("3");
  });

  test("no agrega filtro de existencias cuando ninguno tiene stock", () => {
    const sinStock = productos.map((producto) => ({
      ...producto,
      enStock: false,
    }));

    expect(opcionesFiltroProductos(sinStock)).not.toContain("Con existencias");
  });
});

describe("SubmissionGate", () => {
  test("ejecuta una acción y permite volver a ejecutarla al terminar", async () => {
    const gate = new SubmissionGate();
    const action = jest.fn().mockResolvedValue(undefined);

    await gate.run(action);
    await gate.run(action);

    expect(action).toHaveBeenCalledTimes(2);
  });

  test("evita dos envíos simultáneos", async () => {
    const gate = new SubmissionGate();

    let resolver!: () => void;

    const action = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolver = resolve;
        }),
    );

    const primera = gate.run(action);
    const segunda = gate.run(action);

    expect(action).toHaveBeenCalledTimes(1);

    resolver();

    await primera;
    await segunda;
  });
});
