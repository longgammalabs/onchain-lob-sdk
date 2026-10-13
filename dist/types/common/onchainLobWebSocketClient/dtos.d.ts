export interface SubscribeToSubscriptionWebSocketRequestDto<TSubscription = unknown> {
    method: 'subscribe';
    subscription: TSubscription;
}
export interface UnsubscribeFromSubscriptionWebSocketRequestDto<TSubscription = unknown> {
    method: 'unsubscribe';
    subscription: TSubscription;
}
export interface OnchainLobWebSocketResponseDto {
    channel: string;
    isSnapshot: boolean;
    id: string;
    data: unknown;
}
