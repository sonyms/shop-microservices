pipeline {
    agent any

    parameters {
        choice(name: 'SERVICE_NAME', choices: ['api-gateway', 'auth-service', 'cart-service', 'frontend', 'notification-service', 'order-service', 'product-service', 'user-service'], description: 'Select the microservice to build and deploy')
        string(name: 'RELEASE_VERSION', defaultValue: 'v1.0.0', description: 'Semantic version tag (e.g. v1.0.0)')
    }

    environment {
        // You MUST configure these in Jenkins credentials/env vars
        DOCKER_HUB_CREDENTIALS = credentials('docker-hub-credentials') // Create a Username/Password credential in Jenkins named 'docker-hub-credentials'
        GITHUB_CREDENTIALS = credentials('github-credentials') // Create a Username/Password credential in Jenkins named 'github-credentials'
        DOCKER_HUB_USERNAME = 'sonyms2023'
        GITHUB_REPO_URL = 'https://github.com/sonyms/shop-microservices.git'
        SVC = "${params.SERVICE_NAME}"
        REL = "${params.RELEASE_VERSION}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Compile & Package') {
            when {
                expression { params.SERVICE_NAME != 'frontend' }
            }
            steps {
                sh '''
                echo "Building ${SVC} and its dependencies..."
                mvn clean package -pl ${SVC} -am -DskipTests
                '''
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                sh '''
                # Login to Docker Hub
                echo $DOCKER_HUB_CREDENTIALS_PSW | docker login -u $DOCKER_HUB_CREDENTIALS_USR --password-stdin
                
                IMAGE_NAME="$DOCKER_HUB_USERNAME/${SVC}:${REL}"
                echo "Building and pushing $IMAGE_NAME..."
                
                cd ${SVC}
                docker build -t $IMAGE_NAME .
                docker push $IMAGE_NAME
                cd ..
                '''
            }
        }

        stage('Manual Approval for Deployment') {
            steps {
                input message: "Ready to deploy ${params.SERVICE_NAME}:${params.RELEASE_VERSION}. Update GitOps and Tag Repository?", ok: "Deploy!"
            }
        }

        stage('Update GitOps Manifests') {
            steps {
                sh '''
                NEW_IMAGE="$DOCKER_HUB_USERNAME/${SVC}:${REL}"
                
                # Update the image tag in the specific deployment file
                sed -i "s|image: .*${SVC}.*|image: $NEW_IMAGE|g" gitops/apps/${SVC}/${SVC}.yaml
                '''
            }
        }

        stage('Commit and Tag GitOps Repo') {
            steps {
                sh '''
                # Configure Git
                git config --global user.email "jenkins@ci-cd.local"
                git config --global user.name "Jenkins CI"
                
                # Commit
                git add gitops/apps/${SVC}/${SVC}.yaml
                git commit -m "Deploy: ${SVC}:${REL}"
                
                # Tag
                git tag ${SVC}-${REL}
                
                # Push back to GitHub
                AUTH_URL=$(echo $GITHUB_REPO_URL | sed "s|https://|https://$GITHUB_CREDENTIALS_USR:$GITHUB_CREDENTIALS_PSW@|g")
                git push $AUTH_URL HEAD:main
                git push $AUTH_URL --tags
                '''
            }
        }
    }
    
    post {
        always {
            echo "Pipeline finished!"
        }
    }
}
