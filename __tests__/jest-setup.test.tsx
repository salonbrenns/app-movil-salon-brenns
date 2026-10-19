import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

describe("Configuración de pruebas", () => {
  test("Jest y React Native Testing Library funcionan correctamente", () =>
    render(<Text>Salón Brenn&apos;s</Text>).then(() => {
      expect(screen.getByText("Salón Brenn's")).toBeTruthy();
    }));
});
