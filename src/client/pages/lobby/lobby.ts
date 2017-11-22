import { Component, ViewChild } from '@angular/core';
import { DeepstreamService } from '../../providers/deepstream.service';

@Component({
  selector: 'page-lobby',
  templateUrl: 'lobby.html',
})
export class LobbyPage {

  @ViewChild('scrollArea') private scrollArea;

  public currentMessage: string;

  private update$;

  get state() {
    return this.deepstreamService.lobbyState;
  }

  constructor(
    private deepstreamService: DeepstreamService
  ) {}

  ngOnInit() {
    this.update$ = this.state.onUpdate$.subscribe(() => {
      this.scrollToBottom();
    });

    this.scrollToBottom();
  }

  ngOnDestroy() {
    this.update$.unsubscribe();
  }

  sendMessage() {
    if(!this.currentMessage || !this.currentMessage.trim()) return;
    this.deepstreamService.ds.emitFromState('message', { message: this.currentMessage }, this.state);
    this.currentMessage = '';
  }

  scrollToBottom() {
    setTimeout(() => {
      this.scrollArea.nativeElement.scrollTop = this.scrollArea.nativeElement.scrollHeight;
    });
  }
}
