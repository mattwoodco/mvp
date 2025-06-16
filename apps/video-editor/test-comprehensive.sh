#!/bin/bash

set -e

echo "🎬 Video Editor Service - Comprehensive Test Suite"
echo "=================================================="

BASE_URL="http://localhost:8081"
VIDEO_URL="http://localhost:9000/storage/storage/test-video.mp4"

check_service() {
    echo "🔍 Checking if service is running..."
    if ! curl -s "$BASE_URL/" > /dev/null; then
        echo "❌ Service not running on $BASE_URL"
        echo "💡 Start with: bun run video-editor:dev"
        exit 1
    fi
    echo "✅ Service is running"
}

test_service_info() {
    echo -e "\n📊 Testing service status..."
    curl -s "$BASE_URL/" | jq '.'
}

test_examples_endpoint() {
    echo -e "\n📋 Testing examples endpoint..."
    curl -s "$BASE_URL/examples" | jq '.'
}

test_basic_edit() {
    echo -e "\n🧪 Testing basic video edit..."
    
    local response=$(curl -s -X POST "$BASE_URL/edit" \
        -H "Content-Type: application/json" \
        -d "{
            \"videoUrl\": \"$VIDEO_URL\",
            \"chyron\": {
                \"text\": \"BASIC TEST\",
                \"position\": { \"x\": 50, \"y\": 80, \"anchor\": \"bottom-center\" },
                \"style\": {
                    \"fontSize\": 24,
                    \"fontColor\": \"white\",
                    \"backgroundColor\": \"black\",
                    \"backgroundOpacity\": 0.8
                },
                \"timing\": { \"startTime\": 0, \"duration\": 3 }
            }
        }")
    
    echo "$response" | jq '.'
    
    local success=$(echo "$response" | jq -r '.success')
    if [ "$success" = "true" ]; then
        echo "✅ Basic edit test passed"
        local edited_url=$(echo "$response" | jq -r '.editedVideo')
        echo "🎥 Edited video: $edited_url"
        return 0
    else
        echo "❌ Basic edit test failed"
        return 1
    fi
}

test_news_chyron() {
    echo -e "\n📺 Testing news chyron..."
    
    curl -s -X POST "$BASE_URL/edit" \
        -H "Content-Type: application/json" \
        -d "{
            \"videoUrl\": \"$VIDEO_URL\",
            \"chyron\": {
                \"text\": \"BREAKING: Video Editor Works!\",
                \"position\": { \"x\": 50, \"y\": 90, \"anchor\": \"bottom-center\" },
                \"style\": {
                    \"fontSize\": 32,
                    \"fontColor\": \"white\",
                    \"backgroundColor\": \"red\",
                    \"backgroundOpacity\": 0.9,
                    \"padding\": 15,
                    \"borderRadius\": 5
                },
                \"timing\": { \"startTime\": 0, \"duration\": 5 }
            }
        }" | jq '.editedVideo'
}

test_social_tag() {
    echo -e "\n📱 Testing social media tag..."
    
    curl -s -X POST "$BASE_URL/edit" \
        -H "Content-Type: application/json" \
        -d "{
            \"videoUrl\": \"$VIDEO_URL\",
            \"chyron\": {
                \"text\": \"@chatmtv\",
                \"position\": { \"x\": 10, \"y\": 10, \"anchor\": \"top-left\" },
                \"style\": {
                    \"fontSize\": 18,
                    \"fontColor\": \"white\",
                    \"backgroundColor\": \"black\",
                    \"backgroundOpacity\": 0.7,
                    \"padding\": 8,
                    \"borderRadius\": 12
                },
                \"timing\": { \"startTime\": 0, \"duration\": 10 }
            }
        }" | jq '.editedVideo'
}

test_title_card() {
    echo -e "\n🎭 Testing title card..."
    
    curl -s -X POST "$BASE_URL/edit" \
        -H "Content-Type: application/json" \
        -d "{
            \"videoUrl\": \"$VIDEO_URL\",
            \"chyron\": {
                \"text\": \"Welcome to MVP\",
                \"position\": { \"x\": 50, \"y\": 50, \"anchor\": \"center\" },
                \"style\": {
                    \"fontSize\": 48,
                    \"fontColor\": \"yellow\",
                    \"backgroundColor\": \"black\",
                    \"backgroundOpacity\": 0.8,
                    \"borderColor\": \"yellow\",
                    \"borderWidth\": 2,
                    \"padding\": 20,
                    \"borderRadius\": 10
                },
                \"timing\": { \"startTime\": 1, \"duration\": 3 }
            }
        }" | jq '.editedVideo'
}

test_validation_errors() {
    echo -e "\n🚫 Testing validation errors..."
    
    echo "Testing missing text..."
    curl -s -X POST "$BASE_URL/edit" \
        -H "Content-Type: application/json" \
        -d "{
            \"videoUrl\": \"$VIDEO_URL\",
            \"chyron\": {
                \"position\": { \"x\": 50, \"y\": 50 },
                \"style\": {},
                \"timing\": { \"startTime\": 0, \"duration\": 1 }
            }
        }" | jq '.error'
    
    echo "Testing invalid URL..."
    curl -s -X POST "$BASE_URL/edit" \
        -H "Content-Type: application/json" \
        -d "{
            \"videoUrl\": \"not-a-url\",
            \"chyron\": {
                \"text\": \"Test\",
                \"position\": { \"x\": 50, \"y\": 50 },
                \"style\": {},
                \"timing\": { \"startTime\": 0, \"duration\": 1 }
            }
        }" | jq '.error'
}

run_performance_test() {
    echo -e "\n⚡ Running performance test..."
    
    local start_time=$(date +%s)
    
    test_basic_edit > /dev/null
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo "⏱️  Processing time: ${duration} seconds"
}

check_video_quality() {
    echo -e "\n🔍 Checking video quality parameters..."
    
    local response=$(test_basic_edit)
    local edited_url=$(echo "$response" | jq -r '.editedVideo')
    
    if [ "$edited_url" != "null" ] && [ -n "$edited_url" ]; then
        echo "📊 Analyzing output video quality..."
        
        curl -s "$edited_url" -o /tmp/test-output.mp4
        
        ffprobe -v quiet -print_format json -show_streams -show_format /tmp/test-output.mp4 | jq '{
            format: .format.format_name,
            duration: .format.duration,
            video_codec: .streams[] | select(.codec_type=="video") | .codec_name,
            video_profile: .streams[] | select(.codec_type=="video") | .profile,
            pixel_format: .streams[] | select(.codec_type=="video") | .pix_fmt,
            color_space: .streams[] | select(.codec_type=="video") | .color_space,
            audio_codec: .streams[] | select(.codec_type=="audio") | .codec_name
        }'
        
        rm -f /tmp/test-output.mp4
        
        echo "✅ Video quality check complete"
    else
        echo "❌ No video URL to analyze"
    fi
}

# Main test execution
main() {
    local run_all=true
    local run_quick=false
    local run_validation=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --quick)
                run_quick=true
                run_all=false
                shift
                ;;
            --validation)
                run_validation=true
                run_all=false
                shift
                ;;
            --all)
                run_all=true
                shift
                ;;
            --help)
                echo "Usage: $0 [--quick|--validation|--all|--help]"
                echo "  --quick      Run basic tests only"
                echo "  --validation Run validation error tests"
                echo "  --all        Run comprehensive test suite (default)"
                echo "  --help       Show this help"
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    check_service
    
    if [ "$run_quick" = true ]; then
        test_service_info
        test_basic_edit
    elif [ "$run_validation" = true ]; then
        test_validation_errors
    else
        # Run comprehensive suite
        test_service_info
        test_examples_endpoint
        test_basic_edit
        test_news_chyron
        test_social_tag
        test_title_card
        test_validation_errors
        run_performance_test
        check_video_quality
    fi
    
    echo -e "\n🎉 Test suite completed!"
}

main "$@" 
