import { useAuthSession } from "@/modules/auth/viewmodels/auth-session-provider";
import {
  act,
  render,
  renderHook,
  screen,
  userEvent,
  waitFor,
} from "@testing-library/react-native";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";

import { SupportContact } from "@/modules/legal/components/support-contact";
import { business } from "@/modules/legal/data/business";
import {
  ARCO_RIGHTS,
  useArcoRequestViewModel,
} from "@/modules/legal/viewmodels/use-arco-request-view-model";
import { AccountDeletionView } from "@/modules/legal/views/account-deletion-view";
import { ArcoRequestView } from "@/modules/legal/views/arco-request-view";

jest.mock("expo-linking", () => ({ openURL: jest.fn() }));
jest.mock("expo-clipboard", () => ({ setStringAsync: jest.fn() }));
jest.mock("@/modules/auth/viewmodels/auth-session-provider", () => ({
  useAuthSession: jest.fn(),
}));
jest.mock("@/theme", () => ({ Spacing: { three: 16 } }));
jest.mock("@/components/themed-text", () => ({
  ThemedText:
    jest.requireActual<typeof import("react-native")>("react-native").Text,
}));
jest.mock("@/components/ui/button", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const { Pressable, Text } =
    jest.requireActual<typeof import("react-native")>("react-native");
  return {
    Button: ({
      label,
      onPress,
      disabled,
      loading,
    }: {
      label: string;
      onPress?: () => void;
      disabled?: boolean;
      loading?: boolean;
    }) =>
      React.createElement(
        Pressable,
        {
          accessibilityRole: "button",
          accessibilityLabel: label,
          disabled: disabled || loading,
          onPress,
        },
        React.createElement(Text, null, label),
      ),
  };
});
jest.mock("@/components/ui/text-field", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const { TextInput } =
    jest.requireActual<typeof import("react-native")>("react-native");
  return {
    TextField: ({
      label,
      value,
      onChangeText,
      editable,
    }: {
      label: string;
      value: string;
      onChangeText: (value: string) => void;
      editable?: boolean;
    }) =>
      React.createElement(TextInput, {
        accessibilityLabel: label,
        value,
        onChangeText,
        editable,
      }),
  };
});
jest.mock("@/components/ui/style-guide", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const { Pressable, Text, View } =
    jest.requireActual<typeof import("react-native")>("react-native");
  return {
    ChoiceChips: ({
      options,
      onSelect,
    }: {
      options: readonly { value: string; label: string }[];
      onSelect: (value: string) => void;
    }) =>
      React.createElement(
        View,
        null,
        options.map(({ value, label }) =>
          React.createElement(
            Pressable,
            {
              key: value,
              accessibilityRole: "radio",
              accessibilityLabel: label,
              onPress: () => {
                onSelect(value);
              },
            },
            React.createElement(Text, null, label),
          ),
        ),
      ),
  };
});

const openURL = Linking.openURL as jest.Mock;
const setStringAsync = Clipboard.setStringAsync as jest.Mock;
const authSession = useAuthSession as jest.Mock;

beforeEach(() => {
  openURL.mockReset();
  setStringAsync.mockReset().mockResolvedValue(true);
  authSession
    .mockReset()
    .mockReturnValue({ session: null, status: "anonymous" });
});

test.each(ARCO_RIGHTS)(
  "ARCO prepara %s con correo oficial y caracteres codificados",
  async (right) => {
    openURL.mockResolvedValue(true);
    const { result } = await Promise.resolve(
      renderHook(useArcoRequestViewModel),
    );
    await act(() => {
      result.current.setName("  Ana   López  ");
      result.current.setEmail(" ana@example.com ");
      result.current.setRight(right);
      result.current.setDescription("  Consulta   de mis citas  ");
      result.current.setDataDetails("  Citas   de octubre  ");
      result.current.setRequestedChange("  Corregir   la fecha  ");
    });
    await act(async () => {
      await result.current.prepare();
    });
    const uri = openURL.mock.calls[0][0] as string;
    expect(uri.startsWith(`mailto:${business.email}?`)).toBe(true);
    expect(uri).toContain(
      `subject=${encodeURIComponent(`Solicitud ARCO - ${right} - Salón Brenn's`)}`,
    );
    expect(decodeURIComponent(uri)).toContain("Nombre completo: Ana López");
    expect(decodeURIComponent(uri)).toContain(
      "Descripción: Consulta de mis citas",
    );
    expect(decodeURIComponent(uri)).toContain(
      "Datos involucrados: Citas de octubre",
    );
    expect(decodeURIComponent(uri)).toContain(
      "Solicito indicaciones para verificar mi identidad por un medio seguro.",
    );
    if (right === "Rectificación")
      expect(decodeURIComponent(uri)).toContain(
        "Cambio solicitado: Corregir la fecha",
      );
    else expect(decodeURIComponent(uri)).not.toContain("Cambio solicitado:");
    expect(result.current.mailOpened).toBe(true);
  },
);

test("ARCO valida campos, correo, datos involucrados y cambio de rectificación", async () => {
  const { result } = await Promise.resolve(renderHook(useArcoRequestViewModel));
  await act(async () => {
    await result.current.prepare();
  });
  expect(result.current.validation).toContain("Completa nombre");
  await act(() => {
    result.current.setName("Ana");
    result.current.setEmail("inválido");
    result.current.setRight("Rectificación");
    result.current.setDescription("   ");
  });
  await act(async () => {
    await result.current.prepare();
  });
  expect(result.current.validation).toContain("Completa nombre");
  await act(() => {
    result.current.setDescription("Corregir apellido");
  });
  await act(async () => {
    await result.current.prepare();
  });
  expect(result.current.validation).toContain("correo electrónico válido");
  await act(() => {
    result.current.setEmail("ana@example.com");
  });
  await act(async () => {
    await result.current.prepare();
  });
  expect(result.current.validation).toContain("datos personales involucrados");
  await act(() => {
    result.current.setDataDetails("Apellido");
  });
  await act(async () => {
    await result.current.prepare();
  });
  expect(result.current.validation).toContain("qué cambio solicitas");
  expect(openURL).not.toHaveBeenCalled();
});

test("ARCO conserva los datos y permite copiar correo y solicitud cuando falla la app de correo", async () => {
  openURL.mockRejectedValue(new Error("Sin aplicación"));
  const user = userEvent.setup();
  await Promise.resolve(render(<ArcoRequestView />));
  await user.paste(screen.getByLabelText("Nombre completo"), "Ana López");
  await user.paste(
    screen.getByLabelText("Correo para recibir respuesta"),
    "ana@example.com",
  );
  await user.press(screen.getByRole("radio", { name: "Acceso" }));
  await user.paste(
    screen.getByLabelText("Descripción de la solicitud"),
    "Quiero consultar mis citas",
  );
  await user.press(
    screen.getByRole("button", { name: "Preparar solicitud ARCO" }),
  );
  await waitFor(() => {
    expect(
      screen.getByText(/No se pudo abrir una aplicación de correo/),
    ).toBeTruthy();
  });
  expect(screen.getByLabelText("Nombre completo").props.value).toBe(
    "Ana López",
  );
  expect(screen.queryByText(/Solicitud enviada exitosamente/)).toBeNull();
  await user.press(screen.getByRole("button", { name: "Copiar correo" }));
  expect(setStringAsync).toHaveBeenCalledWith(business.email, {
    android: { isSensitive: true },
  });
  await user.press(screen.getByRole("button", { name: "Copiar solicitud" }));
  expect(setStringAsync.mock.calls[1][0]).toContain(
    "Asunto: Solicitud ARCO - Acceso",
  );
  expect(setStringAsync.mock.calls[1][0]).toContain("Ana López");
});

test("ARCO evita abrir dos borradores mientras la primera apertura está pendiente", async () => {
  let complete!: (value: true) => void;
  openURL.mockImplementation(
    () =>
      new Promise<true>((resolve) => {
        complete = resolve;
      }),
  );
  const { result } = await Promise.resolve(renderHook(useArcoRequestViewModel));
  await act(() => {
    result.current.setName("Ana");
    result.current.setEmail("ana@example.com");
    result.current.setRight("Acceso");
    result.current.setDescription("Mis datos");
  });
  await act(() => {
    void result.current.prepare();
    void result.current.prepare();
  });
  expect(openURL).toHaveBeenCalledTimes(1);
  await act(async () => {
    complete(true);
  });
});

test("eliminación permite cancelar, precarga la sesión y no borra ni cierra sesión al preparar", async () => {
  const signOut = jest.fn();
  authSession.mockReturnValue({
    session: { user: { name: "Ana López", email: "ana@example.com" } },
    signOut,
  });
  openURL.mockResolvedValue(true);
  const user = userEvent.setup();
  await Promise.resolve(render(<AccountDeletionView />));
  await user.press(
    screen.getByRole("button", { name: "Solicitar eliminación de cuenta" }),
  );
  expect(screen.getByLabelText("Nombre del titular").props.value).toBe(
    "Ana López",
  );
  expect(screen.getByLabelText("Correo de la cuenta").props.value).toBe(
    "ana@example.com",
  );
  await user.press(screen.getByRole("button", { name: "Conservar mi cuenta" }));
  expect(openURL).not.toHaveBeenCalled();
  await user.press(
    screen.getByRole("button", { name: "Solicitar eliminación de cuenta" }),
  );
  await user.press(
    screen.getByRole("button", { name: "Sí, preparar solicitud" }),
  );
  await waitFor(() => {
    expect(screen.getByText(/Tu cuenta aún no se ha eliminado/)).toBeTruthy();
  });
  const uri = openURL.mock.calls[0][0] as string;
  expect(uri).toContain(`mailto:${business.email}?`);
  expect(uri).toContain(
    `subject=${encodeURIComponent("Solicitud de eliminación de cuenta - Salón Brenn's")}`,
  );
  expect(decodeURIComponent(uri)).toContain(
    "Correo de la cuenta: ana@example.com",
  );
  expect(decodeURIComponent(uri)).toContain("Nombre del titular: Ana López");
  expect(signOut).not.toHaveBeenCalled();
});

test("eliminación funciona sin sesión y conserva campos cuando falla el correo", async () => {
  openURL.mockRejectedValue(new Error("Sin aplicación"));
  const user = userEvent.setup();
  await Promise.resolve(render(<AccountDeletionView />));
  await user.press(
    screen.getByRole("button", { name: "Solicitar eliminación de cuenta" }),
  );
  await user.press(
    screen.getByRole("button", { name: "Sí, preparar solicitud" }),
  );
  expect(screen.getByText(/Escribe el nombre del titular/)).toBeTruthy();
  expect(openURL).not.toHaveBeenCalled();
  await user.paste(screen.getByLabelText("Nombre del titular"), "Luis");
  await user.paste(
    screen.getByLabelText("Correo de la cuenta"),
    "luis@example.com",
  );
  await user.press(
    screen.getByRole("button", { name: "Sí, preparar solicitud" }),
  );
  await waitFor(() => {
    expect(
      screen.getByText(/No se pudo abrir una aplicación de correo/),
    ).toBeTruthy();
  });
  expect(screen.getByLabelText("Correo de la cuenta").props.value).toBe(
    "luis@example.com",
  );
  await user.press(screen.getByRole("button", { name: "Copiar solicitud" }));
  expect(setStringAsync.mock.calls[0][0]).toContain("Nombre del titular: Luis");
});

test("soporte informa el fallo del correo y conserva la dirección copiable", async () => {
  openURL.mockRejectedValue(new Error("No mail app"));
  const user = userEvent.setup();
  await Promise.resolve(render(<SupportContact />));
  await user.press(screen.getByRole("button", { name: "Contactar soporte" }));
  await waitFor(() => {
    expect(
      screen.getByText(/No se pudo abrir la aplicación de correo/),
    ).toBeTruthy();
  });
  expect(screen.getByText(business.email).props.selectable).toBe(true);
  expect(openURL).toHaveBeenCalledWith(`mailto:${business.email}`);
});
