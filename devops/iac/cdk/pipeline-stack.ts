import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';

export class UserPlatformPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Artifacts
    const sourceOutput = new codepipeline.Artifact('SourceOutput');
    const backendBuildOutput = new codepipeline.Artifact('BackendBuildOutput');
    const frontendBuildOutput = new codepipeline.Artifact('FrontendBuildOutput');

    // 2. CodeBuild Project: Test & Build Backend + Migrations
    const backendBuildProject = new codebuild.PipelineProject(this, 'BackendBuildProject', {
      projectName: 'user-platform-backend-ci',
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        privileged: true,
      },
      buildSpec: codebuild.BuildSpec.fromSourceFilename('devops/buildspec-backend.yml'),
    });

    // 3. CodeBuild Project: Zero-Downtime Migration Verification
    const migrationProject = new codebuild.PipelineProject(this, 'MigrationProject', {
      projectName: 'user-platform-migrations-runner',
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
      },
      buildSpec: codebuild.BuildSpec.fromSourceFilename('devops/buildspec-migrations.yml'),
    });

    // 4. CodeBuild Project: Frontend Build (Angular Lighthouse Optimized)
    const frontendBuildProject = new codebuild.PipelineProject(this, 'FrontendBuildProject', {
      projectName: 'user-platform-frontend-ci',
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        privileged: true,
      },
      buildSpec: codebuild.BuildSpec.fromSourceFilename('devops/buildspec-frontend.yml'),
    });

    // 5. CodePipeline Definition
    new codepipeline.Pipeline(this, 'UserPlatformPipeline', {
      pipelineName: 'user-platform-cicd-pipeline',
      restartExecutionOnUpdate: true,
      stages: [
        // Stage 1: Source
        {
          stageName: 'Source',
          actions: [
            new codepipeline_actions.GitHubSourceAction({
              actionName: 'GitHub_Source',
              owner: 'company-org',
              repo: 'user-platform-upgrade',
              branch: 'main',
              oauthToken: cdk.SecretValue.secretsManager('github-token'),
              output: sourceOutput,
            }),
          ],
        },
        // Stage 2: Test & Build (Parallel Backend & Frontend)
        {
          stageName: 'BuildAndTest',
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: 'Test_And_Build_Backend',
              project: backendBuildProject,
              input: sourceOutput,
              outputs: [backendBuildOutput],
            }),
            new codepipeline_actions.CodeBuildAction({
              actionName: 'Build_Frontend_Angular',
              project: frontendBuildProject,
              input: sourceOutput,
              outputs: [frontendBuildOutput],
            }),
          ],
        },
        // Stage 3: Zero-Downtime Database Migration on Staging
        {
          stageName: 'Staging_Migration_And_Deploy',
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: 'Run_Zero_Downtime_Migrations_Staging',
              project: migrationProject,
              input: sourceOutput,
            }),
          ],
        },
        // Stage 4: Manual Approval Gate for Production
        {
          stageName: 'Production_Approval',
          actions: [
            new codepipeline_actions.ManualApprovalAction({
              actionName: 'Manager_Approval_Before_Prod',
              additionalInformation: 'Verify Lighthouse score 90+ and WebSocket real-time live demo on Staging URL before deploying to Production.',
            }),
          ],
        },
        // Stage 5: Production Deployment with Automated Rollback
        {
          stageName: 'Production_Deploy',
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: 'Deploy_To_ECS_Production',
              project: backendBuildProject,
              input: sourceOutput,
            }),
          ],
        },
      ],
    });
  }
}
