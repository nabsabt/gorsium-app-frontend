import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseSourceService } from '../../@Service/firebase.source.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'home-component',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: true,
  providers: [FirebaseSourceService],
  imports: [MatProgressSpinnerModule, MatIconModule],
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('nextCarouselButton') nextCarouselButton: ElementRef;
  private getImgUrls: Subscription;

  public isLoading: boolean;

  public homeImageUrls: Array<string> = [];
  constructor(
    private activatedRoute: ActivatedRoute,
    private firebaseService: FirebaseSourceService
  ) {}
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.nextCarouselButton.nativeElement.click();
    }, 4000);
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.activatedRoute.fragment.subscribe((fragment: string | null) => {
      if (fragment) this.jumpToSection(fragment);
    });

    this.getImgUrls = this.firebaseService.getHomeImageURLs().subscribe({
      next: (res: Array<string>) => {
        this.homeImageUrls = res;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse): HttpErrorResponse => {
        this.isLoading = false;
        return error;
      },
    });
  }

  public jumpToSection(section: string): void {
    const element = document.getElementById(section);
    if (element) {
      const yOffset = window.innerWidth < 701 ? 75 : 100; // Adjust offset for mobile view
      const y =
        element.getBoundingClientRect().top + window.pageYOffset - yOffset;

      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  ngOnDestroy(): void {
    if (this.getImgUrls) {
      this.getImgUrls.unsubscribe();
    }
  }
}
