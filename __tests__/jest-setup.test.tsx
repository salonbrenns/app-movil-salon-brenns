import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

describe("Configuración de pruebas", () => {
  test("Jest y React Native Testing Library funcionan correctamente", async () => {
    await render(<Text>Salón Brenn&apos;s</Text>);

    expect(screen.getByText("Salón Brenn's")).toBeTruthy();
  });
});
