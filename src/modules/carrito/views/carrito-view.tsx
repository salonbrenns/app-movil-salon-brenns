import { Link, router } from "expo-router";
import { StyleSheet, View } from "react-native";

import { ErrorState } from "@/components/feedback/async-states";
import { ResourceStatus } from "@/components/feedback/resource-status";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { DatosTransferencia } from "@/components/ui/datos-transferencia";
import { Screen } from "@/components/ui/screen";
import { TextLink } from '@/components/ui/text-link';
import { InfoRow, MediaPlaceholder } from "@/components/ui/style-guide";

import { Sizes, Spacing } from "@/theme";
import { formatPrice } from "@/utils/format-price";
import { useCarritoViewModel } from "../viewmodels/use-carrito-view-model";
import { StorePickupInfo } from '@/modules/legal/components/store-pickup-info';

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
            label="Total"
            value={formatPrice(vm.pedidoRegistrado.total)}
            accent
          />

          <ThemedText type="small" themeColor="textSecondary">
            {vm.comprobanteEnviado
              ? "Comprobante enviado correctamente."
              : "Adjunta el comprobante de transferencia para completar este paso."}
          </ThemedText>

          {vm.transferencia.datos && !vm.transferencia.error ? (
            <DatosTransferencia datos={vm.transferencia.datos.banco} />
          ) : null}

          {!vm.comprobanteEnviado ? <Link href={{ pathname: '/pago', params: { tipo: 'pedido', id: vm.pedidoRegistrado.id } }} asChild><Button label="Continuar al pago" /></Link> : null}
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
              <MediaPlaceholder compact source={item.imagen} label={item.titulo} product />
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

            <ThemedText type="small" themeColor="textSecondary">Revisa el total antes de continuar.</ThemedText>
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

              <StorePickupInfo />
              <TextLink href="/cuenta/compras-recogida" label="Consultar política de recogida" />

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

          <View style={styles.legalLinks}>
            <TextLink href="/cuenta/terminos" label="Términos y condiciones" />
            <TextLink href="/cuenta/politicas" label="Políticas de cancelaciones y devoluciones" />
          </View>

          {/* Evitar confirmar nuevamente un pedido registrado */}
          <Button
            label="Pagar"
            loading={vm.ocupado}
            disabled={
              !vm.perfil ||
              !vm.existenciasValidas ||
              !vm.transferencia.datos ||
              !!vm.transferencia.error ||
              vm.transferencia.cargando ||
              vm.cargando ||
              vm.ocupado ||
              !!vm.pedidoRegistrado
            }
            onPress={() => {
              void vm.confirmarPedido((id) => router.push({ pathname: '/pago', params: { tipo: 'pedido', id } }));
            }}
          />
        </>
      ) : null}

      {/* Historial de compras */}
      <TextLink href="/cuenta/compras" label="Ver mis compras" />
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
    gap: Spacing.two,
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
  },
  legalLinks: { gap: Spacing.one },
});
