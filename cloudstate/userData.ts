import { cloudstate } from "freestyle-sh";

@cloudstate
export class UserData {
  static id = "user-data" as const;
  messageCount: number = 0;
  apiKey: string | null = null;
  email: string | null = null;
  isSubscribed: boolean = false;

  incrementMessageCount() {
    this.messageCount++;
    return this.messageCount;
  }

  setApiKey(key: string | null) {
    this.apiKey = key;
  }

  setEmail(email: string | null) {
    this.email = email;
  }

  setSubscriptionStatus(status: boolean) {
    this.isSubscribed = status;
  }

  getMessageCount() {
    return this.messageCount;
  }

  getApiKey() {
    return this.apiKey;
  }

  getEmail() {
    return this.email;
  }

  getSubscriptionStatus() {
    return this.isSubscribed;
  }
}