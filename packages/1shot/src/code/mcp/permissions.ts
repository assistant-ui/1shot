import { create } from "zustand";

export interface PermissionRequest {
  id: string;
  tool_name: string;
  input: any;
  approve: () => void;
  deny: () => void;
}

export interface PermissionsState {
  pendingRequests: PermissionRequest[];
  addRequest: (request: Omit<PermissionRequest, "id">) => void;
}

export const createPermissionsStore = () => {
  return create<PermissionsState>((set) => ({
    pendingRequests: [],

    addRequest: (request) => {
      const id = Math.random().toString(36).substring(2);

      const wrappedApprove = () => {
        request.approve();
        set((state) => ({
          pendingRequests: state.pendingRequests.filter((req) => req.id !== id),
        }));
      };

      const wrappedDeny = () => {
        request.deny();
        set((state) => ({
          pendingRequests: state.pendingRequests.filter((req) => req.id !== id),
        }));
      };

      const fullRequest: PermissionRequest = {
        ...request,
        id,
        approve: wrappedApprove,
        deny: wrappedDeny,
      };

      set((state) => ({
        pendingRequests: [...state.pendingRequests, fullRequest],
      }));
    },
  }));
};
