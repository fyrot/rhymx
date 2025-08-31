export class QueueIdentifier {
  static identifiersDelivered = 0;
  constructor() {

  }
  static generateIdentifier():string {
    this.identifiersDelivered++;
    return "id-"+this.identifiersDelivered.toString();
  } 
}