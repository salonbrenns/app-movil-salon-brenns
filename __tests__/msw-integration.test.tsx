import { render, screen } from "@testing-library/react-native";
import { useEffect, useState } from "react";
import { Text } from "react-native";

import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import { HttpCursosService } from "@/modules/cursos/services/cursos-service";
import { FetchHttpClient } from "@/services/api";

const API_URL = "https://api.brenns.test";

const server = setupServer(
  http.get(`${API_URL}/api/cursos`, () => {
    return HttpResponse.json({
      cursos: [
        {
          id: 1,
          titulo: "Curso de colorimetría",
          descripcion: "Curso de prueba",
          precio_total: "1200.00",
          duracion_horas: 20,
          nivel: "Intermedio",
          fecha_inicio: "2026-10-20",
          fecha_fin: null,
          imagenes: null,
          cupo_maximo: 10,
          inscritos: 2,
        },
      ],
    });
  }),
);

beforeAll(() => {
  server.listen({
    onUnhandledRequest: "error",
  });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

function CursoPrueba() {
  const [estado, setEstado] = useState("Cargando");

  useEffect(() => {
    const httpClient = new FetchHttpClient(() => API_URL);
    const service = new HttpCursosService(httpClient);

    service
      .listar()
      .then((cursos) => {
        setEstado(cursos[0]?.nombre ?? "Sin cursos");
      })
      .catch(() => {
        setEstado("Error");
      });
  }, []);

  return <Text>{estado}</Text>;
}

describe("Integración con API simulada usando MSW", () => {
  test("obtiene cursos desde una respuesta simulada", () =>
    render(<CursoPrueba />).then(async () => {
      expect(await screen.findByText("Curso de colorimetría")).toBeTruthy();
    }));

  test("maneja un error del servidor", async () => {
    server.use(
      http.get(`${API_URL}/api/cursos`, () => {
        return HttpResponse.json(
          {
            error: "Error simulado",
          },
          {
            status: 500,
          },
        );
      }),
    );

    return render(<CursoPrueba />).then(async () => {
      expect(await screen.findByText("Error")).toBeTruthy();
    });
  });
});
