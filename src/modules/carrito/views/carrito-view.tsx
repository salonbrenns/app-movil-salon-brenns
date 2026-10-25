import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";

import { ErrorState } from "@/components/feedback/async-states";
import { ResourceStatus } from "@/components/feedback/resource-status";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { DatosTransferencia } from "@/components/ui/datos-transferencia";
import { PaymentProofUploader } from "@/components/ui/payment-proof-uploader";
import { Screen } from "@/components/ui/screen";
import { InfoRow, MediaPlaceholder } from "@/components/ui/style-guide";

import { Sizes, Spacing } from "@/theme";
import { formatPrice } from "@/utils/format-price";
import { useCarritoViewModel } from "../viewmodels/use-carrito-view-model";

export default function CarritoView() {
  const vm = useCarritoViewModel();

  return (
    <Screen title="Mi carrito" backHref="/">
      {/* Pedido registrado y comprobante */}
      {vm.pedidoRegistrado ? (
        <ThemedView surface="card" style={styles.summary}>
          <ThemedText type="subtitle" themeColor="primary">
            Pedido registrado
          </ThemedText>

          <InfoRow label="Número" value={"#" + vm.pedidoRegistrado.id} />

          <InfoRow
            label="Total informado por el servidor"
            value={formatPrice(vm.pedidoRegistrado.total)}
            accent
          />

          <ThemedText type="small" themeColor="textSecondary">
            {vm.comprobanteEnviado
              ? "Comprobante recibido; el pago sigue pendiente de revisión."
              : "La transferencia y el pago siguen pendientes de validación. Adjunta tu comprobante."}
          </ThemedText>

          {vm.transferencia.datos && !vm.transferencia.error ? (
            <DatosTransferencia datos={vm.transferencia.datos.banco} />
          ) : null}

          {!vm.comprobanteEnviado ? (
            <PaymentProofUploader onUpload={vm.enviarComprobante} />
          ) : null}
        </ThemedView>
      ) : null}

      {/* Estado del carrito */}
      <ResourceStatus
        {...vm}
        empty={vm.items.length === 0 && !vm.pedidoRegistrado}
        emptyTitle="Tu carrito está vacío"
      />

      {/* Productos del carrito */}
      <View style={styles.list}>
        {vm.items.map((item) => (
          <ThemedView key={item.id} surface="card" style={styles.item}>
            <View style={styles.thumbnail}>
              <MediaPlaceholder compact />
            </View>

            <View style={styles.description}>
              <ThemedText type="label">{item.titulo}</ThemedText>

              {item.variante ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {item.variante}
                </ThemedText>
              ) : null}

              <ThemedText type="label">{formatPrice(item.precio)}</ThemedText>

              <View style={styles.controls}>
                <Button
                  label="−"
                  accessibilityLabel={"Reducir cantidad de " + item.titulo}
                  variant="secondary"
                  style={styles.quantityButton}
                  disabled={vm.ocupado || item.cantidad <= 0}
                  onPress={() => {
                    void vm.cambiarCantidad(item.id, item.cantidad - 1);
                  }}
                />

                <ThemedText type="label" style={styles.quantity}>
                  {item.cantidad}
                </ThemedText>

                <Button
                  label="+"
                  accessibilityLabel={"Aumentar cantidad de " + item.titulo}
                  variant="secondary"
                  style={styles.quantityButton}
                  disabled={vm.ocupado || item.cantidad >= item.stock}
                  onPress={() => {
                    void vm.cambiarCantidad(item.id, item.cantidad + 1);
                  }}
                />

                <Button
                  label="Eliminar"
                  variant="secondary"
                  style={styles.removeButton}
                  disabled={vm.ocupado}
                  onPress={() => {
                    void vm.eliminar(item.id);
                  }}
                />
              </View>
            </View>
          </ThemedView>
        ))}
      </View>

      {/* Resumen del carrito */}
      {vm.resumen && vm.items.length > 0 ? (
        <>
          <ThemedView surface="card" style={styles.summary}>
            <InfoRow
              label="Subtotal"
              value={formatPrice(vm.resumen.subtotal)}
            />

            <ThemedText type="small" themeColor="textSecondary">
              El total del pedido y cualquier costo de entrega se confirman en
              el servidor al registrarlo.
            </ThemedText>
          </ThemedView>

          <Button
            label="Vaciar carrito"
            variant="secondary"
            disabled={vm.ocupado}
            onPress={() => {
              void vm.vaciar();
            }}
          />

          {vm.errorPerfil ? (
            <ErrorState message={vm.errorPerfil} onRetry={vm.recargarPerfil} />
          ) : null}

          {/* Datos del usuario y pago */}
          {vm.perfil ? (
            <>
              <ThemedText type="label">Datos del pedido</ThemedText>

              <InfoRow label="Nombre" value={vm.perfil.nombre} />

              <InfoRow label="Correo" value={vm.perfil.correo} />

              <Link href="/cuenta/editar-perfil" asChild>
                <Button label="Editar datos" variant="secondary" />
              </Link>

              <ThemedText type="small" themeColor="textSecondary">
                Todavía no es posible elegir recogida en tienda ni registrar una
                dirección de entrega en la app. El total definitivo se mostrará
                al registrar el pedido.
              </ThemedText>

              {/* Pago exclusivamente por transferencia */}
              <InfoRow label="Método de pago" value="Transferencia bancaria" />

              {vm.transferencia.datos && !vm.transferencia.error ? (
                <DatosTransferencia datos={vm.transferencia.datos.banco} />
              ) : null}

              <ThemedText type="small" themeColor="textSecondary">
                Al confirmar se creará tu pedido pendiente de pago o validación.
                El estado se consulta en Mis compras.
              </ThemedText>
            </>
          ) : null}

          {!vm.existenciasValidas ? (
            <ThemedText type="small" themeColor="textSecondary">
              Revisa las cantidades y existencias antes de confirmar el pedido.
            </ThemedText>
          ) : null}

          {/* Evitar confirmar nuevamente un pedido registrado */}
          <Button
            label="Confirmar pedido"
            loading={vm.ocupado}
            disabled={
              !vm.perfil ||
              !vm.existenciasValidas ||
              vm.cargando ||
              vm.ocupado ||
              !!vm.pedidoRegistrado
            }
            onPress={() => {
              void vm.confirmarPedido();
            }}
          />
        </>
      ) : null}

      {/* Historial de compras */}
      <Link href="/cuenta/compras" asChild>
        <Button label="Ver mis compras" variant="secondary" />
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.three,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  thumbnail: {
    width: Sizes.mediaThumbnail,
    flexShrink: 0,
  },

  description: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.two,
  },

  controls: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: Spacing.one,
  },

  quantityButton: {
    minHeight: Sizes.touchMinWidth,
    height: Sizes.touchMinWidth,
    minWidth: Sizes.touchMinWidth,
    width: Sizes.touchMinWidth,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },

  quantity: {
    minWidth: 24,
    textAlign: "center",
  },

  removeButton: {
    minHeight: Sizes.touchMinWidth,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },

  summary: {
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
});
