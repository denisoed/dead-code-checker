import cliProgress from 'cli-progress';
import chalk from 'chalk';

export interface IProgressConfig {
  enabled: boolean;
  quiet: boolean;
  totalFiles?: number;
}

export class ProgressTracker {
  private multibar: cliProgress.MultiBar | null = null;
  private bars: Map<string, cliProgress.SingleBar> = new Map();
  private config: IProgressConfig;

  constructor(config: IProgressConfig) {
    this.config = config;
    
    if (this.shouldShowProgress()) {
      this.multibar = new cliProgress.MultiBar({
        clearOnComplete: false,
        hideCursor: true,
        format: ' {bar} | {percentage}% | {value}/{total} | {stage} {currentFile}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        barsize: 25,
        forceRedraw: true,
        fps: 10,
        stream: process.stdout,
        noTTYOutput: false
      }, cliProgress.Presets.shades_grey);
    }
  }

  private shouldShowProgress(): boolean {
    return this.config.enabled && 
           !this.config.quiet && 
           process.stdout.isTTY &&
           process.env.NODE_ENV !== 'test';
  }

  public startStage(
    stageId: string, 
    stageName: string, 
    total: number, 
    emoji: string = ''
  ): void {
    if (!this.shouldShowProgress() || !this.multibar) return;

    const displayName = emoji ? `${emoji} ${stageName}` : stageName;
    const bar = this.multibar.create(total, 0, { 
      stage: displayName,
      currentFile: ''
    });
    this.bars.set(stageId, bar);
  }

  public updateStage(stageId: string, increment: number = 1, currentFile?: string): void {
    if (!this.shouldShowProgress()) return;
    
    const bar = this.bars.get(stageId);
    if (bar) {
      const updateData: any = {};
      if (currentFile) {
        updateData.currentFile = this.formatFileName(currentFile);
      }
      bar.increment(increment, updateData);
      
      // Force stdout flush to ensure immediate display
      if (process.stdout.write) {
        process.stdout.write('');
      }
    }
  }

  private formatFileName(filePath: string): string {
    if (!filePath) return '';
    
    // Try to show relative path from src/ or project root
    let displayPath = filePath;
    
    // Remove common prefixes for cleaner display
    if (filePath.includes('/src/')) {
      displayPath = filePath.substring(filePath.indexOf('/src/') + 1);
    } else if (filePath.includes('src/')) {
      displayPath = filePath.substring(filePath.indexOf('src/'));
    } else {
      // Just show filename with some parent directories
      const parts = filePath.split('/');
      if (parts.length > 2) {
        displayPath = '.../' + parts.slice(-2).join('/');
      } else {
        displayPath = parts[parts.length - 1] || filePath;
      }
    }
    
    // Limit length for display
    const maxLength = 35;
    if (displayPath.length > maxLength) {
      displayPath = '...' + displayPath.slice(-(maxLength - 3));
    }
    
    return `📄 ${displayPath}`;
  }

  public completeStage(stageId: string): void {
    if (!this.shouldShowProgress()) return;
    
    const bar = this.bars.get(stageId);
    if (bar) {
      bar.stop();
      this.bars.delete(stageId);
    }
  }

  public stop(): void {
    if (this.multibar) {
      this.multibar.stop();
      this.bars.clear();
    }
  }

  public logMessage(message: string): void {
    if (this.config.quiet) return;
    
    if (this.multibar) {
      // If progress bars are active, we need to clear them temporarily
      console.log(message);
    } else {
      console.log(message);
    }
  }

  public logHeader(): void {
    if (this.config.quiet) return;
    
    if (this.shouldShowProgress()) {
      console.log(chalk.cyan('🔍 Analyzing codebase...'));
    }
  }

  public logSeparator(): void {
    if (this.config.quiet) return;
    console.log(''); // Empty line for spacing
  }
} 